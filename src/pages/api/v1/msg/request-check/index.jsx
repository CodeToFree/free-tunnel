import { sendMsgAPI } from "@/lib/api/msg"
import { MsgCacheStatus, MsgCacheType } from "@/lib/const/msg"
import { FREE_SIGS, SignatureTimesConfig } from "@/lib/const/signatureConfig"
import { MsgCache, Requests, SignatureUser, Tunnels } from "@/lib/db"

export default async function handler(req, res) {
  if (req.method === 'POST') {
    return await post(req, res)
  }
  res.status(404).send()
}

async function post(req, res) {
  const msgs = await MsgCache.find({ status: MsgCacheStatus.URGENT })
  const needSendMsgs = msgs.filter(m => {
    return m._id.split(':')[1] === MsgCacheType.NEED_PARTNER_SIGNATURE
  })
  await checkRequests(needSendMsgs)
  res.json({ result: true })
}

export const checkRequests = async (needSendMsgs) => { 
  const users = await SignatureUser.find().lean()
  const reqs = await Requests.find({ _id: { $in: needSendMsgs.map(m => m._id.split(':')[0]) } })
  const tunnels = await Tunnels.find({ name: { $in: reqs.map(r => r.channel)} })
  await Promise.all(needSendMsgs.map(async (m) => {
    const reqId = m._id.split(':')[0]
    const req = reqs.find(r => r._id === reqId)
    const tunnel = tunnels.find(t => t.name === req?.channel)
    const config = SignatureTimesConfig.find(c => c.id === tunnel?._id)
    if (!config || !req || !tunnel) return
    const unsignedAddress = config.signAddresses.filter(a => ![...FREE_SIGS, ...req.signatures.map(s => s.exe?.toLowerCase())].includes(a))
    const needPartnerSignLen = config.requiredMinSignatures - config.freeSignatures
    const partnerSignedAddresses = req.signatures.map(s => s.exe).filter(a => !FREE_SIGS.includes(a.toLowerCase()))
    if (needPartnerSignLen > partnerSignedAddresses.length) {
      const [chat_id, message_thread_id] = m.chatId.split(':')
      sendMsgAPI({
        message: `👆 Please SIGN\n${unsignedAddress.map(a => {
          const user = users.find(u => u._id === a)
          return user ? `@${user.tgUserName}` : a
        }).join('\n')}`,
        chat_id,
        message_thread_id,
        reply_to_message_id: m.messageId
      })
    } else {
      await MsgCache.updateMany({ _id: { $gt: `${reqId}:`, $lt: `${reqId}:~` } }, { status: MsgCacheStatus.PARTNER_FINISHED })
    }
  }))
}