import { Tunnels } from '@/lib/db'

import { refresh } from './'

export default async function handler(req, res) {
  if (req.method === 'POST') {
    return await post(req, res)
  }
  res.status(404).send()
}

async function post(req, res) {
  const tunnel = await Tunnels.findById(req.query.tunnelId)
  if (!tunnel) {
    return res.status(404).send()
  }

  await Promise.all([...tunnel.from, ...tunnel.to].map(id => refresh(id, tunnel).catch(console.warn)))

  res.json({ result: true })
}
