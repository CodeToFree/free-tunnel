import { ethers } from 'ethers'

import { toValue } from '@/lib/hooks'

export function newRequestId(amount, action = 1, tokenIndex = 1) {
  const value = toValue(amount, 6)
  if (value.lte(0)) {
    return ''
  }

  const now = Math.floor(Date.now() / 1000)
  return ethers.utils.solidityPack(
    ['uint8', 'uint40', 'uint8', 'uint8', 'uint64'],
    [1, now, action, tokenIndex, value]
  )
}