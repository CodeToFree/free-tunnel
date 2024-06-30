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
import xlayer from './chains/xlayer.json'
import merlin from './chains/merlin.json'
import b2 from './chains/b2.json'
import bitlayer from './chains/bitlayer.json'
import bevm from './chains/bevm.json'
import bb from './chains/bb.json'
import bob from './chains/bob.json'
import kava from './chains/kava.json'
import kroma from './chains/kroma.json'
import klaytn from './chains/klaytn.json'
import sepolia from './chains/sepolia.json'
import merlin_testnet from './chains/merlin_testnet.json'
import b2_testnet from './chains/b2_testnet.json'

export const DARK_MODE = process.env.NEXT_PUBLIC_DARK_MODE
export const TESTNET = process.env.NEXT_PUBLIC_TESTNET
export const TRONLINK = process.env.NEXT_PUBLIC_TRONLINK

export const ADDR_ONE = '0x0000000000000000000000000000000000000001'
export const ADDR_ZERO = '0x0000000000000000000000000000000000000000'

export const ROLES = {
  Admin: 'admin',
  Proposer: 'proposer',
  Executor: 'executor',
  Vault: 'vault',
}

const chains = TESTNET
  ? { sepolia, merlin_testnet, b2_testnet }
  : { eth, arb, bnb, polygon, linea, scroll, mode, manta, zklink, core, xlayer, merlin, b2, bitlayer, bevm, bb, bob, kava, kroma, klaytn }

export const CHAINS = Object.entries(chains).map(([id, c]) => ({ ...c, id }))
export const PROPOSE_PERIOD = Number(process.env.NEXT_PUBLIC_PROPOSE_PERIOD || 86400 * 2)
export const EXECUTE_PERIOD = Number(process.env.NEXT_PUBLIC_EXECUTE_PERIOD || 86400 * 3)

export const ADMIN_ADDRS = (process.env.NEXT_PUBLIC_ADMIN_ADDRS || '').split(',')
export const DEFAULT_VAULT = process.env.NEXT_PUBLIC_DEFAULT_VAULT
