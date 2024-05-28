import { ethers } from 'ethers'
import { Channels, Requests } from '@/lib/db'
import { CHAINS } from '@/lib/const'

export default async function handler(req, res) {
  if (req.method === 'PUT') {
    return await put(req, res)
  }
  res.status(404).send()
}

async function put(req, res) {
  const channel = await Channels.findById(req.query.channelId)
  if (!channel) {
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
    channel: channel.name,
    from: { $in: channel.from.map(id => CHAINS.find(c => c.id === id).chainId.toString()) },
    to: { $in: channel.to.map(id => CHAINS.find(c => c.id === id).chainId.toString()) },
  }, update, { new: true })
  res.json({ result: true })
}
