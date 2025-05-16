const { deployContract } = require('./lib')

// List of hubId
// 0x00: ✅ ethereum 20250105
// 0x01: ✅ arbitrum 20250105
// 0x02: ✅ bnb smart chain 20250105
// 0x03: polygon
// 0x04: optimism
// 0x05: ✅ avalanche 20250105
// 0x06: ✅ base 20250105
// 0x07: linea
// 0x08: zksync
// 0x09: scroll
// 0x0a: ✅ mode 20250105
// 0x0b: ✅ manta 20250105
// 0x0c: zklink
// 0x0d: ✅ core 20250105
// 0x0e: xlayer
// 0x0f: mantle
// 0x10: ✅ merlin 20250105
// 0x11: ✅ b2 20250105
// 0x12: ✅ bitlayer 20250105
// 0x13: bevm
// 0x14: bb
// 0x15: ✅ bob 20250105
// 0x16: opbnb
// 0x17: ✅ sonic 20250105
// 0x18: ✅ cfx 20250105
// 0x1a: ✅ neox 20250105
// 0x1b: ✅ soneium 20250105
// 0x20: kava
// 0x21: kroma
// 0x22: ✅ kaia 20250105
// 0x23: ailayer
// 0x24: zircuit
// 0x25: iotex
// 0x26: zeta
// 0x27: ✅ taiko 20250105
// 0x28: ✅ sei 20250105
// 0x29: ✅ duck 20250105
// 0x2a: ✅ morph 20241220
// 0x2b: ✅ exsat 20241206
// 0x2c: ✅ hemi 20250105
// 0x2d: ✅ corn 20241206
// 0x2e: ✅ lisk 20241206
// 0x2f: ✅ taker 20241220
// 0x30: ✅ rsk 20250105
// 0x31: ✅ bera 20250105
// 0xa0: (non-evm) sui
// 0xf0: sepolia
// 0xf1: merlin_testnet
// 0xf2: b2_testnet
// 0xf3: ✅ hype_testnet 20250105
// 0xf4: ✅ memecore_testnet 20250105

module.exports = async function deployHub() {
  await hre.run('compile')

  const chainConfig = require(`../src/lib/const/chains/${hre.network.name}.json`)
  const impl = await deployContract('FreeTunnelHub')

  const data = impl.interface.encodeFunctionData('initialize', [chainConfig.hubId])
  const proxy = await deployContract('ERC1967Proxy', [impl.address, data])

  return proxy.address
}
