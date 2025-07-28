import { sendMsg } from "./api/msg"
import { CHAT_ID, NODE_ENV } from "./const"
import { defaultTokens } from "./const/defaultTokens"
import { MsgCacheStatus, MsgCacheType } from "./const/msg"
import { FREE_LP_ADDRESSES, FREE_SIGS, getSignatureTimesConfig } from "./const/signatureConfig"
import { MsgCache, SignatureUser } from "./db"
import { parseRequest } from "./request"
import { shortenAddress } from "./utils"

const FreeResponsiblePeople = ['@phil_0']

const REQ_FINISHED = 'REQ_FINISHED'
const REQ_CANCELD = 'REQ_CANCELD'

export const sendSignatureNotice = async (item) => {
  try {
    if (!item || !Object.keys(item.hash || {}).length) return

    const config = getSignatureTimesConfig(item.tunnel._id)
    if (!config) return

    const swapInfo = formatSwapInfo(item._id, item.tunnel)
    const signatures = item.signatures
    const signatureLength = signatures.length
    const noticeIsLpTransationText = getNoticeIsLpTransationText(item)

    checkUrgentStatus(item, config)

    if (isCanceled(item.hash) && !isStage2Finished(item.hash)) {
      sendMsg({
        message: `${swapInfo.msg}\n↩️ CANCELLED`,
        cacheId: `${item._id}:${MsgCacheType.NEED_PROPOSE}`
      })
      return
    }

    if ((isStage2Finished(item.hash) && isStage1Finished(item.hash))) {
      const signatureUsers = await getSignatureUsers(config)
      const status = getFinishStatus(item.hash)
      const msgInfoParams = { swapInfo, config, signLen: signatureLength, signatures, signatureUsers, status }
      sendSignatureMsg({...msgInfoParams, reqId: item._id})
      signatureLength >= config.requiredMinSignatures && sendMsg({
        message: `${swapInfo.msg}\n${status === REQ_FINISHED ? `✅ EXECUTED` : `↩️ CANCELLED`}`,
        cacheId: `${item._id}:${MsgCacheType.NEED_EXECUTE}`
      })

      isCanceled(item.hash) && sendMsg({
        message: `${swapInfo.msg}\n↩️ CANCELLED`,
        cacheId: `${item._id}:${MsgCacheType.NEED_PROPOSE}`
      })
      return
    }

    // To notice free to propose
    if (isOnlyProposedByUser(item.hash)) {
      sendMsg({
        message: `${swapInfo.msg}\n${FreeResponsiblePeople.join(' ')} Please PROPOSE 👉🏻 ${swapInfo.url}${noticeIsLpTransationText}`,
        cacheId: `${item._id}:${MsgCacheType.NEED_PROPOSE}`
      })
      return
    }

    if (!isAllProposed(item.hash)) {
      return
    }

    sendMsg({
      message: `${swapInfo.msg}\n✅ PROPOSED`,
      cacheId: `${item._id}:${MsgCacheType.NEED_PROPOSE}`
    })

    if (signatureLength <= config.maxSignatureCount) {
      const signatureUsers = await getSignatureUsers(config)
      const msgInfoParams = { swapInfo, config, signLen: signatureLength, signatures, signatureUsers, externalText: noticeIsLpTransationText }
      sendSignatureMsg({...msgInfoParams, reqId: item._id})
    }

    // need to be executed
    if (signatureLength >= config.requiredMinSignatures) {
      sendMsg({
        message: `${swapInfo.msg}\n${FreeResponsiblePeople.join(' ')} Please EXECUTE 👉🏻 ${swapInfo.url}${noticeIsLpTransationText}`,
        cacheId: `${item._id}:${MsgCacheType.NEED_EXECUTE}`
      })
      return
    }

  } catch (error) {
    const message = '[msg sendSignatureNotice error] '
    console.log(message, error)
    sendMsg({ message: message + JSON.stringify(error) })
  }
}

const isStage2Finished = (hash) => { 
  const { p2, c2, e2} = hash
  return p2 && (c2 || e2)
}

const isStage1Finished = (hash) => { 
  const { p1, c1, e1} = hash
  return p1 && (c1 || e1)
}

const isCanceled = (hash) => {
  const keys = Object.keys(hash)
  const cancelLength = keys.filter(k => k[0] === 'c').length
  const proposeLength = keys.filter(k => k[0] === 'p').length
  if (cancelLength === proposeLength) {
    return REQ_CANCELD
  }
}

const getFinishStatus = (hash) => {
  if (isCanceled(hash)) {
    return REQ_CANCELD
  }
  return REQ_FINISHED
}

const isAllProposed = (hash) => {
  const { p1, p2 } = hash
  return p1 && p2
}

const isOnlyProposedByUser = (hash) => {
  return Object.keys(hash).length === 1 && hash.p1
}

const sendSignatureMsg = async (msgInfoParams) => {
  const { config, reqId } = msgInfoParams
  if (config.freeSignatures > 0) {
    sendMsg({
      message: getSignatureMsg(msgInfoParams),
      cacheId: `${reqId}:${MsgCacheType.NEED_FREE_SIGNATURE}`
    })
  }

  config.chatId?.map((id, index) => {
    const [chatId, messageThreadId] = id.split(':')
    sendMsg({
      message: getSignatureMsg(msgInfoParams),
      chatId,
      messageThreadId,
      cacheId: `${reqId}:${MsgCacheType.NEED_PARTNER_SIGNATURE}:${index}`
    })
  })
}

const getSignatureUsers = async (config) => {
  return await SignatureUser.find({ _id: { $in: config.signAddresses || [] } }).lean()
}

const formatSwapInfo = (reqId, tunnel) => {
  if (!reqId) return ''
  try {
    const parsedValue = parseRequest(reqId)
    const url = getUrl(parsedValue, tunnel)
    const isUnlock = getIsUnlock(parsedValue)
    const fromName = isUnlock ? parsedValue.toChain?.name : parsedValue.fromChain?.name
    const toName = isUnlock ? parsedValue.fromChain?.name : parsedValue.toChain?.name
    return {
      msg: `${parsedValue.value} ${defaultTokens[parsedValue.tokenIndex]} from ${fromName} to ${toName}`,
      url,
    }
  } catch (error) {
    console.error('[msg formatSwapInfo error]', error)
    return `[msg formatSwapInfo error] ${reqId}`
  }
}

const getSignatureMsg = ({ swapInfo, config, signLen, externalText = '', signatures, signatureUsers, status }) => {
  const { requiredMinSignatures, signAddresses } = config
  const reachRequired = requiredMinSignatures <= signLen
  const { msg, url } = swapInfo
  const linkText = reachRequired ? '' : `Please verify and SIGN 👉🏻 ${url}\n`
  let signatureUseText = getSignatureUseText(signAddresses, signatures, signatureUsers, reachRequired)

  if (signatureUseText.length !== 0) {
    signatureUseText = `\n${signatureUseText}\n`
  }
  const requiredText = reachRequired ? 'Ready To Execute' : `${requiredMinSignatures} signatures required to execute${externalText}`
  const finishText = status === REQ_FINISHED ? '✅ EXECUTED' : '↩️ CANCELLED'
  return `${msg}\n${linkText}${signatureUseText}\n${status ? finishText : requiredText}`
}

const getSignatureUseText = (signAddresses, signatures, signatureUsers, reachRequired) => {
  return (signAddresses || [])
    .filter(addr => {
      if (!reachRequired) return true
      return signatures.some(s => s.exe.toLowerCase() === addr.toLowerCase())
    }).map(addr => {
      const isSigned = signatures.find(s => s.exe.toLowerCase() === addr.toLowerCase())
      const text = `${isSigned ? '✅' : '*️⃣'} `
      const user = signatureUsers.find(u => u._id.toLowerCase() === addr.toLowerCase())
      return `${text} ${user ? `${user.tgUserName.split(',').map(n => `@${n}`).join(' ')}` : shortenAddress(addr)}`
    }).join('\n')
}

const getNoticeIsLpTransationText = (item) => {
  return FREE_LP_ADDRESSES.includes(item.recipient.toLowerCase()) ? '\n\n❗️Meson initiated transaction for liquidity rebalancing. Please sign first.' : ''
}

const SwapType = {
  LOCK_MINT: 1,
  BURN_UNLOCK: 2,
  BURN_MINT: 3,
}

const NON_EVM_CHAINS = ['aptos', 'sui', 'movement', 'rooch']

const getUrl = (parsedValue, tunnel) => {
  const isUnlock = getIsUnlock(parsedValue)
  const isNonEvm = [...(tunnel.from || []), ...tunnel.to || []].some(i => NON_EVM_CHAINS.includes(i))
  const domain = isNonEvm ? 'https://nonevm.free.tech' : 'https://tunnel.free.tech'
  return `${domain}/${tunnel._id}${isUnlock ? '/unlock' : ''}`
}

const getIsUnlock = (parsedValue) => {
  const type = parsedValue.actionId & 0x0f
  return type === SwapType.BURN_UNLOCK
}

const checkUrgentStatus = async (item, config) => {
  const reqId = item._id
  const msgCache = await MsgCache.findOne({
    _id: { $regex: `^${reqId}:${MsgCacheType.NEED_PARTNER_SIGNATURE}` },
    status: MsgCacheStatus.URGENT
  }).lean()
  if (!msgCache) {
    return
  }
  
  const needPartnerSignLen = config.requiredMinSignatures - config.freeSignatures
  const partnerSignedAddresses = item.signatures.map(s => s.exe).filter(a => !FREE_SIGS.includes(a.toLowerCase()))
  const isFinished = (isStage2Finished(item.hash) && isStage1Finished(item.hash))
  if (needPartnerSignLen <= partnerSignedAddresses.length || isFinished) {
    await MsgCache.updateMany({ _id: { $gt: `${reqId}:` } }, { status: MsgCacheStatus.PARTNER_FINISHED })
  }
}