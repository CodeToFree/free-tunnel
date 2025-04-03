import { CHAINS } from '@/lib/const'

export default async function handler(req, res) {
  if (req.method === 'GET') {
    return await get(req, res)
  }
  res.status(404).send()
}

async function get(req, res) {
  const entries = Object.values(CHAINS).map(c => {
    const match = Object.entries(c.tokens).find(([addr, symbol]) => symbol === req.query.symbol)
    if (!match) {
      return
    }
    return [c.id, match[0]]
  }).filter(Boolean)


  res.json({ result: Object.fromEntries(entries) })
}
