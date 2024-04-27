import { ethers } from 'ethers'

import { Requests } from '@/lib/db'
import { BRIDGE_CHANNEL, CHAINS_FROM, CHAINS_TO } from '@/lib/const'
import { parseRequest } from '@/lib/request'

const events = {
  // '0xc7f505b2f371ae2175ee4913f4499e1f2633a7b5936321eed1cdaeb6115181d2': 'Initialized',
  // '0xbc7cd75a20ee27fd9adebab32041f755214dbc6bffa90cc0225b39da2e5c2d3b': 'Upgraded',
  // '0xf8ccb027dfcd135e000e9d45e6cc2d662578a8825d4c45b5e32e0adf67e79ec6': 'AdminTransferred',
  // '0xb707b889cced682704e0cf1e7335f22abdfdfe14d9db54a47a1b8ec4d42406ee': 'VaultTransferred',
  // '0x2bf05609716bc4b090ad0e99b47b91881c7517771259c625df05db7e9d8c8181': 'ProposerAdded',
  // '0x0782d5a983f4f99019eb2dc8dfe67419752a13dca743154e71029fc01318d055': 'TokenAdded',
  '0x56f55aead8b59181fdff5497b6e66dbf6e45dc38bc59023cd1eb5b5657a134fa': 'TokenLockProposed',
  '0x930a00540f7b6ebe716d5bc3cd6a963cfcc17295d86ea4a47c6ce7bcc55bf144': 'TokenLockExecuted',
  '0x0947081fc739b6bd9d04e8351b71b85c9da260db9da35c8f1e7b6a00e3239d4e': 'TokenLockCancelled',
  '0x71db1cdc4627ec462d4505bcdc558ed71e5df98157dc0d54ae5404fa41e84dcb': 'TokenMintProposed',
  '0xd8cf6b5491e7c90a12dfa30c1e953e502e1f88ed615826fc4d92e578d0b18f16': 'TokenMintExecuted',
  '': 'TokenMintCancelled',
  '0x7633f64cfde7bf6cb57b1c425c9bb7b5ff97200a9e50028232edb2b951acf4f8': 'TokenBurnProposed',
  '0x3176f0038ab9592a2c2714382347b46a56d7463637897f96da7bc7422da58410': 'TokenBurnExecuted',
  '0x1ddac62124b119ca03938d470a086327983c6af84d0a692542c6afdf6c30202b': 'TokenBurnCancelled',
  '0xadeba355367ba829c72a6c1961984bf03b6a05c5a743c62bfced85e6b1fc1edd': 'TokenUnlockProposed',
  '0x92fd09a543e2e6a459f5e6a96fdf98f7fc614eee2145af3f9d2b9f33360f4268': 'TokenUnlockExecuted',
  '': 'TokenUnlockCancelled',
}

export default async function handler(req, res) {
  if (req.method === 'POST') {
    return await post(req, res)
  }
  res.status(404).send()
}

async function post(req, res) {
  await Promise.all([...CHAINS_FROM, ...CHAINS_TO].map(refresh))

  res.json({ result: true  })
}

async function refresh(chain) {
  const provider = new ethers.providers.StaticJsonRpcProvider(chain.rpcUrl)
  const latest = await provider.getBlockNumber('latest')

  let toBlock = latest - 50
  let reqs = []
  while (toBlock > latest - 5000) {
    const logs = await provider.getLogs({
      fromBlock: toBlock - 999,
      toBlock,
      address: chain.AtomicContract,
      topics: [],
    })

    reqs = reqs.concat(logs.map(log => {
      const [sig, param1, param2] = log.topics
      const event = events[sig]
      if (!event) {
        return
      }
      const reqId = param1?.substring(0, 38)
      const { fromChain, toChain } = parseRequest(reqId)
      const addr = param2 && ethers.utils.hexZeroPad(BigInt(param2), 20)
      return { event, hash: log.transactionHash, reqId, fromChain, toChain, addr }
    }).filter(Boolean))

    toBlock -= 1000
  }

  for (let req of reqs) {
    const update = {}
    if (['TokenLockProposed', 'TokenBurnProposed'].includes(req.event)) {
      update['hash.p1'] = '^' + req.hash
      update.channel = BRIDGE_CHANNEL
      update.from = req.fromChain.chainId.toString()
      update.to = req.toChain.chainId.toString()
      update.proposer = ethers.utils.getAddress(req.addr)
    } else if (['TokenMintProposed', 'TokenUnlockProposed'].includes(req.event)) {
      update['hash.p2'] = '^' + req.hash
    } else if (['TokenLockExecuted', 'TokenBurnExecuted'].includes(req.event)) {
      update['hash.e1'] = '^' + req.hash
    } else if (['TokenMintExecuted', 'TokenUnlockExecuted'].includes(req.event)) {
      update['hash.e2'] = '^' + req.hash
    } else if (['TokenLockCancelled', 'TokenBurnCancelled'].includes(req.event)) {
      update['hash.c1'] = '^' + req.hash
    } else if (['TokenMintCancelled', 'TokenUnlockCancelled'].includes(req.event)) {
      update['hash.c2'] = '^' + req.hash
    } else {
      continue
    }
    await Requests.findByIdAndUpdate(req.reqId, update, { upsert: true })
  }

  return true
}
