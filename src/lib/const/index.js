import eth from './chains/eth.json'
import arb from './chains/arb.json'
import bnb from './chains/bnb.json'
import polygon from './chains/polygon.json'
import linea from './chains/linea.json'
import scroll from './chains/scroll.json'
import mode from './chains/mode.json'
import manta from './chains/manta.json'
import zklink from './chains/zklink.json'
import core from './chains/core.json'
import merlin from './chains/merlin.json'
import b2 from './chains/b2.json'
import bitlayer from './chains/bitlayer.json'
import bevm from './chains/bevm.json'
import bb from './chains/bb.json'

export const DARK_MODE = process.env.NEXT_PUBLIC_DARK_MODE
export const TESTNET = process.env.NEXT_PUBLIC_TESTNET
export const TRONLINK = process.env.NEXT_PUBLIC_TRONLINK

export const ADDR_ONE = '0x0000000000000000000000000000000000000001'
export const ADDR_ZERO = '0x0000000000000000000000000000000000000000'

export const ROLES = {
  Admin: 'admin', 
  Proposer: 'proposer', 
  Executor: 'executor', 
}

const chains = { eth, arb, bnb, polygon, linea, scroll, mode, manta, zklink, core, merlin, b2, bitlayer, bevm, bb }

export const CHAINS = Object.entries(chains).map(([id, c]) => ({ ...c, id }))
export const PROPOSE_PERIOD = Number(process.env.NEXT_PUBLIC_PROPOSE_PERIOD || 86400 * 2)
export const EXECUTE_PERIOD = Number(process.env.NEXT_PUBLIC_EXECUTE_PERIOD || 86400 * 3)
