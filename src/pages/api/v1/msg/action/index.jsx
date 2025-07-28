import { sendMsgAPI } from "@/lib/api/msg"
import { MsgErrorCode, MsgErrorMsg } from "@/lib/const/errorCode"
import { MsgCacheStatus, MsgCacheType } from "@/lib/const/msg"
import { FREE_SIG_1, FREE_SIG_2, FREE_SIGS, SignatureTimesConfig } from "@/lib/const/signatureConfig"
import { MsgCache, Requests, Tunnels } from "@/lib/db"
import { checkRequests } from "../request-check"

export default async function handler(req, res) {
  if (req.method === 'POST') {
    return await post(req, res)
  }
  res.status(404).send()
}

async function post(req, res) {
  const { params, method } = req.body

  if (method === 'urgent_signature') {
    try {
      const item = await MsgCache.findOne({ messageId: params.reply_id })
      
      if (item) {
        const { config, reqItem, reqId } = await getConfig(item._id)
        if (!config) return formatErrorMsg(res, MsgErrorCode.MSG_CONFIG_NOT_FOUND)
  
        const needPartnerSignLength = config.requiredMinSignatures - config.freeSignatures
        const partnerSigned = reqItem.signatures.map(s => s.exe).filter(s => !FREE_SIGS.includes(s.toLowerCase()))
    
        if (needPartnerSignLength > partnerSigned.length) {
          const needSendMsg = await MsgCache.find({ _id: { $regex: `^${reqId}:${MsgCacheType.NEED_PARTNER_SIGNATURE}` } }).lean()
          if (!needSendMsg || !needSendMsg.length) return formatErrorMsg(res, MsgErrorCode.MSG_PARTNER_SIGNATURE_MSG_NOT_FOUND)
          
          await MsgCache.updateMany({ _id: { $regex: `^${reqId}:` } }, { status: MsgCacheStatus.URGENT })
          // check immediately
          checkRequests(needSendMsg.map(m => ({ ...m, status: MsgCacheStatus.URGENT })))
        } else {
          return formatErrorMsg(res, MsgErrorCode.MSG_SIGNATURES_REACH_REQUIRED)
        }
        res.json({ result: true })
      } else {
        return formatErrorMsg(res, MsgErrorCode.MSG_RECORD_NOT_FOUND)
      }
    } catch (error) {
      console.log('[msg urgent error]', error)
    }
  }
  res.json({ result: true })
}

const getConfig = async (_id) => {
  const reqId = _id.split(':')[0]
  const reqItem = await Requests.findOne({ _id: reqId })
  const tunnel = await Tunnels.findOne({ name: reqItem.channel }).lean()
  const config = SignatureTimesConfig.find(c => c.id === tunnel._id)
  return { reqItem, config, reqId }
}

const formatErrorMsg = (res, code) => {
  res.json({ code, message: MsgErrorMsg[code] })
}