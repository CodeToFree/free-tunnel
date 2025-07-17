import { Fees } from '@/lib/db'

export default async function handler(req, res) {
  if (req.method === 'GET') {
    return await get(req, res)
  }
  res.status(404).send()
}

async function get(req, res) {
  const fee = (await Fees.findById('default'))?.rules || null
  res.json({ result: fee })
}
