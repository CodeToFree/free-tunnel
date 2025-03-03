import { Tunnels } from '@/lib/db'

const { NON_EVM } = process.env

export default async function handler(req, res) {
  if (req.method === 'GET') {
    return await get(req, res)
  }
  res.status(404).send()
}

async function get(req, res) {
  const query = {}
  if (NON_EVM) {
    query.to = { $in: ['sui', 'aptos', 'movement', 'rooch'] }
  }
  const result = await Tunnels.find(query).sort({ priority: -1 }).select('_id name logo lock mint from to contracts')
  res.json({ result: result.map(({ _id, name, logo, lock, mint, from, to, contracts }) => ({ id: _id, name, logo, lock, mint, from, to, contracts })) })
}
