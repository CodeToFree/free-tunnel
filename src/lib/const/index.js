import eth from './chains/eth.json'
import arb from './chains/arb.json'
import goerli from './chains/goerli.json'
import b2_testnet from './chains/b2_testnet.json'

export const DARK_MODE = process.env.NEXT_PUBLIC_DARK_MODE
export const TESTNET = process.env.NEXT_PUBLIC_TESTNET
export const TRONLINK = process.env.NEXT_PUBLIC_TRONLINK

export const ADDR_ZERO = '0x0000000000000000000000000000000000000000'

export const CHAINS = TESTNET ? [goerli, b2_testnet] : [eth, arb]
