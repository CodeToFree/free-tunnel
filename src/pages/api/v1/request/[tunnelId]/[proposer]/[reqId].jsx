import { ethers } from 'ethers'
import { Tunnels, Requests } from '@/lib/db'
import { CHAINS } from '@/lib/const'
import { sendMsgToTg, sendMsg } from '@/lib/api/msg'
import { getSignatureTimesConfig } from '@/lib/const/signatureConfig'

export default async function handler(req, res) {
  if (req.method === 'PUT') {
    return await put(req, res)
  }
  res.status(404).send()
}

async function put(req, res) {
  const tunnel = await Tunnels.findById(req.query.tunnelId)
  if (!tunnel) {
    return res.status(404).send()
  }
  const { proposer, reqId } = req.query
  const { hash = {}, signature = {} } = req.body
  const { p2, e1, e2, c1, c2 } = hash
  const update = {}
  if (ethers.utils.isHexString(p2)) {
    update['hash.p2'] = p2
  }
  if (ethers.utils.isHexString(e1)) {
    update['hash.e1'] = e1
  }
  if (ethers.utils.isHexString(e2)) {
    update['hash.e2'] = e2
  }
  if (ethers.utils.isHexString(c1)) {
    update['hash.c1'] = c1
  }
  if (ethers.utils.isHexString(c2)) {
    update['hash.c2'] = c2
  }
  const { sig, exe } = signature
  if (sig && exe) {
    // TODO: check signature
    update.$addToSet = { signatures: { sig, exe } }
  }
  const params = {
    _id: reqId,
    proposer,
    channel: tunnel.name,
  }
  const item = await Requests.findOneAndUpdate(params, update, { new: true }).lean()
  sendSignatureNotice({...item, tunnelId: tunnel._id})

  res.json({ result: true })
}

export const sendSignatureNotice = (item) => {
  try {
    if (!item) return
    const { e1, e2, c2 } = item.hash
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
    console.log('[msg sendSignatureNotice error] ', error)
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