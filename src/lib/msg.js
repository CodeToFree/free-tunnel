import { sendMsg } from "./api/msg"
import { defaultTokens } from "./const/defaultTokens"
import { getSignatureTimesConfig } from "./const/signatureConfig"
import { parseRequest } from "./request"

export const sendSignatureNotice = (item) => {
  try {
    if (!item) return
    const swapInfo = formatSwapInfo('0x01006866239003520000000000001d980031')
    const config = getSignatureTimesConfig(item.tunnelId)
    const signatureLength = item.signatures.length
    if (!config) return

    // All executed or cancelled, don't need to do anything
    if (isStage2Finished(item.hash) && isStage1Finished(item.hash)) {
      return
    }

    // To notice free to propose
    if (isOnlyProposedByUser(item.hash)) {
      sendMsg({ message: `${item._id} needs to be proposed` })
      return
    }

    if (!isAllProposed(item.hash)) {
      return
    }

    // Send to free
    if (signatureLength < config.freeSignatures) {
      sendMsg({ message: `Free signature: ${swapInfo}` })
      return
    }

    // Send to partner
    if (
      signatureLength >= config.freeSignatures
      && signatureLength < config.requiredMinSignatures
    ) {
      sendMsg({
        message: `Partner signature: ${swapInfo}`,
        chat_id: config.chat_id || '-4946255911',
        message_thread_id: config.message_thread_id
      })
      return
    }
    // need to be executed
    if (signatureLength >= config.requiredMinSignatures) {
      sendMsg({ message: `Free excecute: ${swapInfo}` })
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

const formatSwapInfo = (reqId) => {
  if (!reqId) return ''
  try {
    const parsedValue = parseRequest(reqId)
    return `${parsedValue.value} ${defaultTokens[parsedValue.tokenIndex]} from ${parsedValue.fromChain?.name} to ${parsedValue.toChain?.name}`
  } catch (error) {
    console.error('[msg formatSwapInfo error]')
    return `[msg formatSwapInfo error] ${reqId}`
  }
}