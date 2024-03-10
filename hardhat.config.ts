import '@nomiclabs/hardhat-ethers'

import { task } from 'hardhat/config'

import config from './config.json'

task('deploy', 'Deploy Contract')
  .setAction(async () => {
    const deploy = require('./scripts/deploy')
    await deploy()
  })

export default {
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
  defaultNetwork: 'arbitrum',
  networks: {
    mainnet: {
      url: "https://rpc.ankr.com/eth",
    },
    arbitrum: {
      url: "https://1rpc.io/arb",
    }
  }
}
