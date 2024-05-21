import eth from './chains/eth.json'
import arb from './chains/arb.json'
import bnb from './chains/bnb.json'
import polygon from './chains/polygon.json'
import linea from './chains/linea.json'
import mode from './chains/mode.json'
import manta from './chains/manta.json'
import zklink from './chains/zklink.json'
import core from './chains/core.json'
import merlin from './chains/merlin.json'
import b2 from './chains/b2.json'
import bitlayer from './chains/bitlayer.json'
import bevm from './chains/bevm.json'
import bb from './chains/bb.json'
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
}

let CONTRACT_ADDRS
try {
  CONTRACT_ADDRS = JSON.parse(process.env.NEXT_PUBLIC_CONTRACT_ADDRS)
} catch {}

const chains = Object.fromEntries(Object.entries({ eth, arb, bnb, polygon, linea, mode, manta, zklink, core, merlin, b2, bitlayer, bevm, bb, sepolia, merlin_testnet, b2_testnet })
  .map(([id, c]) => [id, ({ ...c, AtomicContract: CONTRACT_ADDRS[id] })])
)

export const CHAINS_FROM = process.env.NEXT_PUBLIC_CHAINS_FROM.split(',').map(c => chains[c])
export const CHAINS_TO = process.env.NEXT_PUBLIC_CHAINS_TO.split(',').map(c => chains[c])
export const BRIDGE_CHANNEL = process.env.NEXT_PUBLIC_BRIDGE_CHANNEL
export const PROPOSE_PERIOD = Number(process.env.NEXT_PUBLIC_PROPOSE_PERIOD || 86400 * 2)
export const EXECUTE_PERIOD = Number(process.env.NEXT_PUBLIC_EXECUTE_PERIOD || 86400 * 3)

export const PROJECT_ICON = process.env.NEXT_PUBLIC_PROJECT_ICON
export const PROJECT_HOMEPAGE = process.env.NEXT_PUBLIC_PROJECT_HOMEPAGE

let vaultLimit = {}
try {
  vaultLimit = JSON.parse(process.env.NEXT_PUBLIC_VAULT_LIMIT)
} catch {}
export const VAULT_LIMIT = vaultLimit

let bridgeFee = {}
try {
  bridgeFee = JSON.parse(process.env.NEXT_PUBLIC_BRIDGE_FEE)
} catch {}
export const BRIDGE_FEE = bridgeFee

let min = {}
try {
  min = JSON.parse(process.env.NEXT_PUBLIC_MIN_AMOUNTS)
} catch {}
export const MIN_AMOUNTS = min

let tokenPaths = {}
try {
  tokenPaths = JSON.parse(process.env.NEXT_PUBLIC_TOKEN_PATHS)
} catch {}
export const TOKEN_PATHS = tokenPaths
