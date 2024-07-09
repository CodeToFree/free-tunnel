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

  const reqs = await Requests.find({ proposer: req.query.proposer, channel: channel.name })
  res.json({ result: reqs })
}
