import { Tunnels, Requests } from '@/lib/db'

export default async function handler(req, res) {
  if (req.method === 'GET') {
    return await get(req, res)
  }
  res.status(404).send()
}

async function get(req, res) {
  const tunnel = await Tunnels.findById(req.query.tunnelId)
  if (!tunnel) {
    return res.status(404).send()
  }

  const reqs = await Requests.find({ proposer: req.query.proposer, channel: tunnel.name })
  res.json({ result: reqs })
}
