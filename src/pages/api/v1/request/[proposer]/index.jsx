import { Requests } from '@/lib/db'
import { BRIDGE_CHANNEL, CHAINS_FROM, CHAINS_TO } from '@/lib/const'

export default async function handler(req, res) {
  if (req.method === 'GET') {
    return await get(req, res)
  }
  res.status(404).send()
}

async function get(req, res) {
  const reqs = await Requests.find({
    proposer: req.query.proposer,
    channel: BRIDGE_CHANNEL,
    from: { $in: CHAINS_FROM.map(c => c.chainId.toString()) },
    to: { $in: CHAINS_TO.map(c => c.chainId.toString()) },
  })
  res.json({ result: reqs })
}
