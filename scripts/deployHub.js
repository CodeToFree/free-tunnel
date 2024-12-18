const { deployContract } = require('./lib')

// List of hubId
// 0x00: ethereum
// 0x01: ✅ arbitrum 20241206
// 0x02: ✅ bnb smart chain 20241206
// 0x03: polygon
// 0x04: optimism
// 0x05: avalanche
// 0x06: ✅ base 20241218
// 0x07: linea
// 0x08: zksync
// 0x09: scroll
// 0x0a: mode
// 0x0b: manta
// 0x0c: zklink
// 0x0d: core
// 0x0e: xlayer
// 0x0f: mantle
// 0x10: merlin
// 0x11: b2
// 0x12: ✅ bitlayer 20241206
// 0x13: bevm
// 0x14: bb
// 0x15: bob
// 0x16: opbnb
// 0x1a: neox
// 0x20: kava
// 0x21: kroma
// 0x22: kaia
// 0x23: ailayer
// 0x24: zircuit
// 0x25: iotex
// 0x26: zeta
// 0x27: ✅ taiko 20241206
// 0x28: sei
// 0x29: duck
// 0x2a: ✅ morph 20241206
// 0x2b: ✅ exsat 20241206
// 0x2c: ✅ hemi 20241206
// 0x2d: ✅ corn 20241206
// 0x2e: ✅ lisk 20241206
// 0x2f: ✅ taker 20241218
// 0xa0: (non-evm) sui
// 0xf0: sepolia
// 0xf1: merlin-testnet
// 0xf2: b2-testnet

module.exports = async function deployHub() {
  await hre.run('compile')

  const chainConfig = require(`../src/lib/const/chains/${hre.network.name}.json`)
  const impl = await deployContract('FreeTunnelHub')
  await impl.deployed()

  const data = impl.interface.encodeFunctionData('initialize', [chainConfig.hubId])
  const proxy = await deployContract('ERC1967Proxy', [impl.address, data])
  await proxy.deployed()

  return proxy.address
}
