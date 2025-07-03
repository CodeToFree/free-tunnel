import { sendMsg } from "./api/msg"
import { getSignatureTimesConfig } from "./const/signatureConfig"

export const sendSignatureNotice = (item) => {
  try {
    sendMsg({ message: '[msg sendSignatureNotice start] ' })
    if (!item) return
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
      sendMsg({ message: `Free: ${item._id} needs to be signatured` })
      return
    }

    // Send to partner
    if (
      signatureLength >= config.freeSignatures
      && signatureLength < config.requiredMinSignatures
    ) {
      sendMsg({
        message: `${item._id} needs to be signatured`,
        chat_id: config.chat_id || '-4875991412',
        message_thread_id: config.message_thread_id
      })
      return
    }
    // need to be executed
    if (signatureLength >= config.requiredMinSignatures) {
      sendMsg({ message:  `${item._id} needs to be excecute` })
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