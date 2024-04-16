import { ethers } from 'ethers'

import { CHAINS_FROM, CHAINS_TO } from '@/lib/const'
import { toValue } from '@/lib/hooks'

export function newRequestId(action, amount, tokenIndex, from, to, vault) {
  const value = toValue(amount, 6)
  if (value.lte(0) || !tokenIndex || typeof from !== 'number' || !to) {
    return ''
  }

  const now = Math.floor(Date.now() / 1000)
  let actionId = action === 'lock-mint' ? 1 : 2
  if (vault) {
    actionId |= 0x10
  }
  return ethers.utils.solidityPack(
    ['uint8', 'uint40', 'uint8', 'uint8', 'uint64', 'uint8', 'uint8'],
    [1, now, actionId, tokenIndex || 0, value, from, to]
  )
}

export function parseRequest(id) {
  const v = parseInt(id.substring(0, 4))
  const created = parseInt('0x' + id.substring(4, 14))
  const actionId = parseInt('0x' + id.substring(14, 16))
  const tokenIndex = parseInt('0x' + id.substring(16, 18))
  const value = ethers.utils.formatUnits('0x' + id.substring(18, 34), 6)
  const fromChain = CHAINS_FROM.find(c => c.atomicId === parseInt('0x' + id.substring(34, 36))) || CHAINS_FROM[0]
  const toChain = CHAINS_TO.find(c => c.atomicId === parseInt('0x' + id.substring(36, 38))) || CHAINS_TO[0]
  const vault = (actionId & 0x10) > 0

  return { id, v, created, actionId, tokenIndex, value, fromChain, toChain, vault }
}
