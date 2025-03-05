import { Tunnels, Requests } from '@/lib/db'

export default async function handler(req, res) {
  if (req.method === 'GET') {
    return await get(req, res)
  }
  res.status(404).send()
}

async function get(req, res) {
  const reqId = req.query.reqId
  if (reqId) {
    const req = await Requests.findById(reqId.substring(0, 38))
    res.json({ result: req })
    return
  }

  const tunnels = await Tunnels.find()
  const tunnelByName = Object.fromEntries(tunnels.map(c => ([c.name, c._id])))

  const aggregated = await Requests.aggregate([
    {
      $match: {
        channel: { $exists: true },
        $or: [
          { 'hash.e1': { $exists: false }, 'hash.c1': { $exists: false } },
          { 'hash.e2': { $exists: false }, 'hash.c2': { $exists: false } },
        ]
      }
    },
    {
      $group: {
        _id: { proposer: '$proposer', tunnel: '$channel' },
        proposer: { $first: '$proposer' },
        tunnel: { $first: '$channel' },
        reqs: { $push: { id: '$_id', recipient: '$recipient', hash: '$hash', signatures: '$signatures' } }
      }
    },
    {
      $group: {
        _id: '$tunnel',
        reqsByProposer: { $push: { proposer: '$proposer', reqs: '$reqs' } },
      }
    },
  ])

  const result = Object.fromEntries(aggregated.map(item => {
    if (!tunnelByName[item._id]) {
      return
    }
    return [
      tunnelByName[item._id],
      Object.fromEntries(item.reqsByProposer.map(({ proposer, reqs }) => [proposer, reqs])),
    ]
  }).filter(Boolean))

  res.json({ result })
}
