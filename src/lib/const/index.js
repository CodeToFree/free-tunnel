import eth from './chains/eth.json'
import arb from './chains/arb.json'
import bnb from './chains/bnb.json'
import polygon from './chains/polygon.json'
import opt from './chains/opt.json'
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
import sonic from './chains/sonic.json'
import cfx from './chains/cfx.json'
import neox from './chains/neox.json'
import soneium from './chains/soneium.json'
import kava from './chains/kava.json'
import kroma from './chains/kroma.json'
import kaia from './chains/kaia.json'
import ailayer from './chains/ailayer.json'
import zircuit from './chains/zircuit.json'
import iotex from './chains/iotex.json'
import zeta from './chains/zeta.json'
import taiko from './chains/taiko.json'
import sei from './chains/sei.json'
import duck from './chains/duck.json'
import morph from './chains/morph.json'
import exsat from './chains/exsat.json'
import hemi from './chains/hemi.json'
import corn from './chains/corn.json'
import lisk from './chains/lisk.json'
import taker from './chains/taker.json'
import rsk from './chains/rsk.json'
import bera from './chains/bera.json'
import memecore from './chains/memecore.json'
import sui from './chains/sui.json'
import sepolia from './chains/sepolia.json'
import merlin_testnet from './chains/merlin_testnet.json'
import b2_testnet from './chains/b2_testnet.json'
import hype_testnet from './chains/hype_testnet.json'
import memecore_testnet from './chains/memecore_testnet.json'

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

const chains = TESTNET ? {
  sepolia, merlin_testnet, b2_testnet, hype_testnet, memecore_testnet
} : {
  eth, arb, bnb, polygon, opt, avax, base, linea, zksync, scroll, mode, manta, zklink, core, xlayer, mantle,
  merlin, b2, bitlayer, bevm, bb, bob, opbnb, sonic, cfx, neox, soneium,
  kava, kroma, kaia, ailayer, zircuit, iotex, zeta, taiko, sei, duck, morph, exsat, hemi, corn, lisk, taker,
  rsk, bera, memecore,
  sui,
  hype_testnet, memecore_testnet,
}

export const CHAINS = Object.entries(chains).map(([id, c]) => ({ ...c, id }))
export const PROPOSE_PERIOD = Number(process.env.NEXT_PUBLIC_PROPOSE_PERIOD || 86400 * 2)
export const EXECUTE_PERIOD = Number(process.env.NEXT_PUBLIC_EXECUTE_PERIOD || 86400 * 3)

export const ADMIN_ADDRS = (process.env.NEXT_PUBLIC_ADMIN_ADDRS || '').split(',')
