import eth from './chains/eth.json'
import goerli from './chains/goerli.json'
import arb from './chains/arb.json'
import tron from './chains/tron.json'

export const DARK_MODE = process.env.NEXT_PUBLIC_DARK_MODE
export const TESTNET = process.env.NEXT_PUBLIC_TESTNET
export const TRONLINK = process.env.NEXT_PUBLIC_TRONLINK

export const ADDR_ZERO = '0x0000000000000000000000000000000000000000'

export const CHAINS = TESTNET ? [goerli] : [eth, arb, tron]
