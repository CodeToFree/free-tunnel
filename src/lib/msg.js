import { MsgCacheType, sendMsg } from "./api/msg"
import { CHAT_ID } from "./const"
import { defaultTokens } from "./const/defaultTokens"
import { getSignatureTimesConfig } from "./const/signatureConfig"
import { MsgCache } from "./db"
import { parseRequest } from "./request"

const FreeResponsiblePeople = ['@phil_0']

export const sendSignatureNotice = (item) => {
  try {
    if (!item || !Object.keys(item.hash || {}).length) return
    const swapInfo = formatSwapInfo(item._id, item.tunnelId)
    const config = getSignatureTimesConfig(item.tunnelId)
    const signatureLength = item.signatures.length
    if (!config) return

    // All executed or cancelled, don't need to do anything
    if (isStage2Finished(item.hash) && isStage1Finished(item.hash)) {
      sendMsg({
        message: `🤳🏻 ${swapInfo.msg}\n ✅ EXECUTED`,
        cache_id: `${item._id}:${MsgCacheType.NEED_EXECUTE}`
      })
      return
    }

    // To notice free to propose
    if (isOnlyProposedByUser(item.hash)) {
      sendMsg({
        message: `🙌🏻 ${swapInfo.msg}\n @phil_0 Please PROPOSE  👉🏻 ${swapInfo.url}`,
        cache_id: `${item._id}:${MsgCacheType.NEED_PROPOSE}`
      })
      return
    }

    if (!isAllProposed(item.hash)) {
      return
    }

    sendMsg({
      message: `🙌🏻 ${swapInfo.msg}\n ✅ PROPOSED`,
      cache_id: `${item._id}:${MsgCacheType.NEED_PROPOSE}`
    })

    if (signatureLength <= config.requiredMinSignatures) {
      if (config.freeSignatures > 0) {
        sendMsg({
          message: getMessageInfo({ swapInfo, config, signLen: signatureLength, forFree: true}),
          cache_id: `${item._id}:${MsgCacheType.NEED_FREE_SIGNATURE}`
        })
      }

      sendMsg({
        message: getMessageInfo({ swapInfo, config, signLen: signatureLength}),
        chat_id: config.chat_id || CHAT_ID,
        message_thread_id: config.message_thread_id,
        cache_id: `${item._id}:${MsgCacheType.NEED_PARTNER_SIGNATURE}`
      })
    }

    // need to be executed
    if (signatureLength >= config.requiredMinSignatures) {
      sendMsg({
        message: `🤳🏻 ${swapInfo.msg}\n ${FreeResponsiblePeople.join(' ')} Please EXECUTE 👉🏻 ${swapInfo.url}`,
        cache_id: `${item._id}:${MsgCacheType.NEED_EXECUTE}`
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

const isAllProposed = (hash) => {
  const { p1, p2 } = hash
  return p1 && p2
}

const isOnlyProposedByUser = (hash) => {
  return Object.keys(hash).length === 1 && hash.p1
}

const formatSwapInfo = (reqId, tunnelId) => {
  if (!reqId) return ''
  try {
    const parsedValue = parseRequest(reqId)
    const url = getUrl(parsedValue, tunnelId)
    return {
      msg: `${parsedValue.value} ${defaultTokens[parsedValue.tokenIndex]} from ${parsedValue.fromChain?.name} to ${parsedValue.toChain?.name}`,
      url,
    }
  } catch (error) {
    console.error('[msg formatSwapInfo error]')
    return `[msg formatSwapInfo error] ${reqId}`
  }
}

const getMessageInfo = ({ swapInfo, config, signLen, forFree }) => {
  const { requiredMinSignatures, responsiblePeople = [] } = config
  const responsiblePeopleStr = forFree ? FreeResponsiblePeople.join(' ') : responsiblePeople.join(' ')
  const { msg, url } = swapInfo
  return `✍🏽 ${msg}\n ${responsiblePeopleStr} Please verify and SIGN 👉🏻 ${url} \n ${requiredMinSignatures === signLen ? '✅ ' : ''} ${requiredMinSignatures} required, ${signLen} signed`
}

const SwapType = {
  LOCK_MINT: 1,
  BURN_UNLOCK: 2,
  BURN_MINT: 3,
}

const getUrl = (parsedValue, tunnelId) => {
  const type = parsedValue.actionId & 0x0f
  const isUnlock = type === SwapType.BURN_UNLOCK
  return `https://tunnel.free.tech/${tunnelId}${isUnlock ? 'unlock' : ''}`
}