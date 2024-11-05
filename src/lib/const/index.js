import eth from './chains/eth.json'
import arb from './chains/arb.json'
import bnb from './chains/bnb.json'
import polygon from './chains/polygon.json'
import avax from './chains/avax.json'
import base from './chains/base.json'
import linea from './chains/linea.json'
import zksync from './chains/zksync.json'
import scroll from './chains/scroll.json'
import mode from './chains/mode.json'
import manta from './chains/manta.json'
import zklink from './chains/zklink.json'
import core from './chains/core.json'
import xlayer from './chains/xlayer.json'
import mantle from './chains/mantle.json'
import merlin from './chains/merlin.json'
import b2 from './chains/b2.json'
import bitlayer from './chains/bitlayer.json'
import bevm from './chains/bevm.json'
import bb from './chains/bb.json'
import bob from './chains/bob.json'
import opbnb from './chains/opbnb.json'
import kava from './chains/kava.json'
import kroma from './chains/kroma.json'
import klaytn from './chains/klaytn.json'
import ailayer from './chains/ailayer.json'
import zircuit from './chains/zircuit.json'
import iotex from './chains/iotex.json'
import zeta from './chains/zeta.json'
import taiko from './chains/taiko.json'
import sei from './chains/sei.json'
import duck from './chains/duck.json'
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
  : { eth, arb, bnb, polygon, avax, base, linea, zksync, scroll, mode, manta, zklink, core, xlayer, mantle, merlin, b2, bitlayer, bevm, bb, bob, opbnb, kava, kroma, klaytn, ailayer, zircuit, iotex, zeta, taiko, sei, duck }

export const CHAINS = Object.entries(chains).map(([id, c]) => ({ ...c, id }))
export const PROPOSE_PERIOD = Number(process.env.NEXT_PUBLIC_PROPOSE_PERIOD || 86400 * 2)
export const EXECUTE_PERIOD = Number(process.env.NEXT_PUBLIC_EXECUTE_PERIOD || 86400 * 3)

export const ADMIN_ADDRS = (process.env.NEXT_PUBLIC_ADMIN_ADDRS || '').split(',')
