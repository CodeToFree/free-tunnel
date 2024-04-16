import '@nomiclabs/hardhat-ethers'
import '@nomiclabs/hardhat-waffle'

import { task } from 'hardhat/config'

import config from './config.json'

task('deploy', 'Deploy Contract')
  .setAction(async () => {
    const deploy = require('./scripts/deploy')
    await deploy()
  })

task('upgrade', 'Upgrade Contract')
  .setAction(async () => {
    const upgrade = require('./scripts/upgrade')
    await upgrade()
  })

task('update-quota', 'Update Mint Quota')
  .setAction(async () => {
    const updateMintQuota = require('./scripts/updateMintQuota')
    await updateMintQuota()
  })

const hardhatConfig = {
  solidity: {
    version: config.compilers.solc,
    settings: {
      optimizer: config.compilers.optimizer,
      evmVersion: config.compilers.evmVersion,
      viaIR: true,
      metadata: {
        // do not include the metadata hash, since this is machine dependent
        // and we want all generated code to be deterministic
        // https://docs.soliditylang.org/en/v0.7.6/metadata.html
        bytecodeHash: 'none',
      },
    },
  },
  defaultNetwork: 'eth',
  networks: {
    eth: {
      url: "https://rpc.ankr.com/eth",
    },
    arbitrum: {
      url: "https://1rpc.io/arb",
    },
    bnb: {
      url: "https://bsc-dataseed1.bnbchain.org",
    },
    mode: {
      url: "https://mainnet.mode.network",
    },
    merlin: {
      url: "https://rpc.merlinchain.io",
    },
    b2: {
      url: "https://rpc.bsquared.network",
    },
    bitlayer: {
      url: "https://mainnet-rpc.bitlayer.org",
    },
    sepolia: {
      url: "https://eth-sepolia.public.blastapi.io",
    },
    merlin_testnet: {
      url: "https://testnet-rpc.merlinchain.io",
    },
    b2_testnet: {
      url: "https://haven-rpc.bsquared.network",
    },
  }
}

export default hardhatConfig
