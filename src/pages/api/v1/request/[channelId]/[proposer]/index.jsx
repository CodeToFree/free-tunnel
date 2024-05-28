import { Channels, Requests } from '@/lib/db'
import { CHAINS } from '@/lib/const'

export default async function handler(req, res) {
  if (req.method === 'GET') {
    return await get(req, res)
  }
  res.status(404).send()
}

async function get(req, res) {
  const channel = await Channels.findById(req.query.channelId)
  if (!channel) {
    return res.status(404).send()
  }

  const reqs = await Requests.find({
    proposer: req.query.proposer,
    channel: channel.name,
    from: { $in: channel.from.map(id => CHAINS.find(c => c.id === id).chainId.toString()) },
    to: { $in: channel.to.map(id => CHAINS.find(c => c.id === id).chainId.toString()) },
  })
  res.json({ result: reqs })
}
