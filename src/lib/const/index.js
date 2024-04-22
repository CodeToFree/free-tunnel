import eth from './chains/eth.json'
import arb from './chains/arb.json'
import bnb from './chains/bnb.json'
import mode from './chains/mode.json'
import manta from './chains/manta.json'
import merlin from './chains/merlin.json'
import b2 from './chains/b2.json'
import bitlayer from './chains/bitlayer.json'
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

const chains = Object.fromEntries(Object.entries({ eth, arb, bnb, mode, manta, merlin, b2, bitlayer, sepolia, merlin_testnet, b2_testnet })
  .map(([id, c]) => [id, ({ ...c, AtomicContract: CONTRACT_ADDRS[id] })])
)

export const CHAINS_FROM = process.env.NEXT_PUBLIC_CHAINS_FROM.split(',').map(c => chains[c])
export const CHAINS_TO = process.env.NEXT_PUBLIC_CHAINS_TO.split(',').map(c => chains[c])
export const BRIDGE_CHANNEL = process.env.NEXT_PUBLIC_BRIDGE_CHANNEL
export const PROPOSE_PERIOD = Number(process.env.NEXT_PUBLIC_PROPOSE_PERIOD || 1800)
export const EXECUTE_PERIOD = Number(process.env.NEXT_PUBLIC_EXECUTE_PERIOD || 86400)

export const PROJECT_ICON = process.env.NEXT_PUBLIC_PROJECT_ICON
export const PROJECT_HOMEPAGE = process.env.NEXT_PUBLIC_PROJECT_HOMEPAGE

export const VAULT_LIMIT = Number(process.env.NEXT_PUBLIC_VAULT_LIMIT || 0)

let min = {}
try {
  min = JSON.parse(process.env.NEXT_PUBLIC_MIN_AMOUNTS)
} catch {}

export const MIN_AMOUNTS = min
