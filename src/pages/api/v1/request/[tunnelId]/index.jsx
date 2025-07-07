import { Tunnels, Requests } from '@/lib/db'
import { sendSignatureNotice } from '@/lib/msg'
import { parseRequest } from '@/lib/request'

export default async function handler(req, res) {
  if (req.method === 'GET') {
    return await get(req, res)
  } else if (req.method === 'POST') {
    return await post(req, res)
  } else if (req.method === 'OPTIONS') {
    return await res.end()
  }
  res.status(404).send()
}

async function get(req, res) {
  const tunnel = await Tunnels.findById(req.query.tunnelId)
  if (!tunnel) {
    return res.status(404).send()
  }

  const aggregated = await Requests.aggregate([
    {
      $match: { channel: tunnel.name },
    },
    {
      $group: {
        _id: '$proposer',
        reqs: { $push: { id: '$_id', recipient: '$recipient', hash: '$hash', signatures: '$signatures' } }
      }
    }
  ])

  const result = Object.fromEntries(aggregated.map(({ _id, reqs }) => [_id, reqs]))

  res.json({ result })
}

async function post(req, res) {
  const tunnel = await Tunnels.findById(req.query.tunnelId)
  if (!tunnel) {
    return res.status(404).send()
  }

  const { proposer, reqId, recipient, hash } = req.body
  const { fromChain, toChain } = parseRequest(reqId)
  const update = {
    proposer,
    recipient,
  }
  if (hash) {
    update['hash.p1'] = hash
    update.channel = tunnel.name
    update.from = fromChain.chainId.toString()
    update.to = toChain.chainId.toString()
  }
  const item = await Requests.findByIdAndUpdate(reqId, update, { upsert: true, new: true }).lean()
  sendSignatureNotice({ ...item, tunnelId: tunnel.id })
  res.json({ result: true })
}
