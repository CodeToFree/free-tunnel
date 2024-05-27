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

  const result = await Requests.aggregate([
    {
      $match: {
        channel: channel.name,
        from: { $in: channel.from.map(id => CHAINS.find(c => c.id === id).chainId.toString()) },
        to: { $in: channel.to.map(id => CHAINS.find(c => c.id === id).chainId.toString()) },
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
