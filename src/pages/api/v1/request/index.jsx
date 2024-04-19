import { Requests } from '@/lib/db'
import { BRIDGE_CHANNEL, CHAINS_FROM, CHAINS_TO } from '@/lib/const'
import { parseRequest } from '@/lib/request'

export default async function handler(req, res) {
  if (req.method === 'GET') {
    return await get(req, res)
  } else if (req.method === 'POST') {
    return await post(req, res)
  }
  res.status(404).send()
}

async function get(req, res) {
  const result = await Requests.aggregate([
    {
      $match: {
        channel: BRIDGE_CHANNEL,
        from: { $in: CHAINS_FROM.map(c => c.chainId.toString()) },
        to: { $in: CHAINS_TO.map(c => c.chainId.toString()) },
      },
    },
    {
      $group: {
        _id: '$proposer',
        reqs: { $push: { id: '$_id', recipient: '$recipient', hash: '$hash', signatures: '$signatures' } }
      }
    }
  ])
  res.json({ result })
}

async function post(req, res) {
  const { proposer, reqId, recipient, hash } = req.body
  const { fromChain, toChain } = parseRequest(reqId)
  const update = {
    proposer,
    recipient,
  }
  if (hash) {
    update['hash.p1'] = hash
    update.channel = BRIDGE_CHANNEL
    update.from = fromChain.chainId.toString()
    update.to = toChain.chainId.toString()
  }
  await Requests.findByIdAndUpdate(reqId, update, { upsert: true })
  res.json({ result: true })
}
