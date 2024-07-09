import { Channels, Requests } from '@/lib/db'
import { CHAINS } from '@/lib/const'
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
  const channel = await Channels.findById(req.query.channelId)
  if (!channel) {
    return res.status(404).send()
  }

  const aggregated = await Requests.aggregate([
    {
      $match: { channel: channel.name },
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
  const channel = await Channels.findById(req.query.channelId)
  if (!channel) {
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
    update.channel = channel.name
    update.from = fromChain.chainId.toString()
    update.to = toChain.chainId.toString()
  }
  await Requests.findByIdAndUpdate(reqId, update, { upsert: true })
  res.json({ result: true })
}
