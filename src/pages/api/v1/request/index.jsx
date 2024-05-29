import { Channels, Requests } from '@/lib/db'

export default async function handler(req, res) {
  if (req.method === 'GET') {
    return await get(req, res)
  }
  res.status(404).send()
}

async function get(req, res) {
  const channels = await Channels.find()
  const channelByName = Object.fromEntries(channels.map(c => ([c.name, c._id])))

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
        _id: { proposer: '$proposer', channel: '$channel' },
        proposer: { $first: '$proposer' },
        channel: { $first: '$channel' },
        reqs: { $push: { id: '$_id', recipient: '$recipient', hash: '$hash', signatures: '$signatures' } }
      }
    },
    {
      $group: {
        _id: '$channel',
        reqsByProposer: { $push: { proposer: '$proposer', reqs: '$reqs' } },
      }
    },
  ])

  const result = Object.fromEntries(aggregated.map(item => {
    if (!channelByName[item._id]) {
      return
    }
    return [
      channelByName[item._id],
      Object.fromEntries(item.reqsByProposer.map(({ proposer, reqs }) => [proposer, reqs])),
    ]
  }).filter(Boolean))

  res.json({ result })
}
