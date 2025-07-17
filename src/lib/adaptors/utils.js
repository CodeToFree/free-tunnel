import { utils } from 'ethers'

export function vectorize(hex) {
  return Array.from(utils.arrayify(hex))
}

export function formatMoveAddress(addr) {
  const parts = addr.split('::')
  if (!parts[0].startsWith('0x')) {
    parts[0] = '0x' + parts[0]
  }
  parts[0] = utils.hexZeroPad(parts[0], 32)
  return parts.join('::')
}
