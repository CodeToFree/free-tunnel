import { ethers } from 'ethers'
import { Tunnels, Requests } from '@/lib/db'
import { CHAINS } from '@/lib/const'

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
  await Requests.findOneAndUpdate({
    _id: reqId,
    proposer,
    channel: tunnel.name,
  }, update, { new: true })
  res.json({ result: true })
}
