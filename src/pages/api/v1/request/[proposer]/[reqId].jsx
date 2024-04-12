import { Requests } from '@/lib/db'
import { BRIDGE_CHANNEL, CHAINS_FROM, CHAINS_TO } from '@/lib/const'

export default async function handler(req, res) {
  if (req.method === 'PUT') {
    return await put(req, res)
  }
  res.status(404).send()
}

async function put(req, res) {
  const { proposer, reqId } = req.query
  const { hash = {}, signature = {} } = req.body
  const { p2, e1, e2 } = hash
  const update = {}
  if (p2) {
    update['hash.p2'] = p2
  }
  if (e1) {
    update['hash.e1'] = e1
  }
  if (e2) {
    update['hash.e2'] = e2
  }
  const { sig, exe } = signature
  if (sig && exe) {
    // TODO: check signature
    update.$addToSet = { signatures: { sig, exe } }
  }
  await Requests.findOneAndUpdate({
    _id: reqId,
    proposer,
    channel: BRIDGE_CHANNEL,
    from: { $in: CHAINS_FROM.map(c => c.chainId.toString()) },
    to: { $in: CHAINS_TO.map(c => c.chainId.toString()) },
  }, update, { new: true })
  res.json({ result: true })
}
