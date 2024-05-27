import { Channels } from '@/lib/db'

export default async function handler(req, res) {
  if (req.method === 'GET') {
    return await get(req, res)
  }
  res.status(404).send()
}

async function get(req, res) {
  const result = await Channels.find().sort({ priority: -1 }).select('_id name logo')
  res.json({ result: result.map(({ _id, name, logo }) => ({ id: _id, name, logo })) })
}
