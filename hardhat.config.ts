import '@nomiclabs/hardhat-ethers'
import '@nomiclabs/hardhat-waffle'
import '@matterlabs/hardhat-zksync-deploy'
import '@matterlabs/hardhat-zksync-solc'
import "@matterlabs/hardhat-zksync-verify"

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
  zksolc: {
    version: '1.3.22',
    compilerSource: 'binary',
    settings: {},
  },
  defaultNetwork: 'eth',
  networks: {
    eth: {
      url: "https://rpc.ankr.com/eth",
    },
    arb: {
      url: "https://1rpc.io/arb",
    },
    bnb: {
      url: "https://rpc.ankr.com/bsc",
    },
    polygon: {
      url: "https://polygon-rpc.com",
    },
    avax: {
      url: "https://api.avax.network/ext/bc/C/rpc",
    },
    linea: {
      url: "https://rpc.linea.build",
    },
    scroll: {
      url: "https://rpc.scroll.io",
    },
    mode: {
      url: "https://mainnet.mode.network",
    },
    manta: {
      url: "https://pacific-rpc.manta.network/http",
    },
    zklink: {
      url: "https://rpc.zklink.io",
      zksync: true,
      ethNetwork: 'eth',
      verifyURL: 'https://explorer.zklink.io/contract_verification',
    },
    core: {
      url: "https://rpc.coredao.org",
    },
    xlayer: {
      url: "https://rpc.xlayer.tech",
    },
    mantle: {
      url: "https://rpc.mantle.xyz",
    },
    merlin: {
      url: "https://rpc.merlinchain.io",
    },
    b2: {
      url: "https://rpc.bsquared.network",
    },
    bitlayer: {
      url: "https://rpc.bitlayer.org",
    },
    bevm: {
      url: "https://rpc-mainnet-1.bevm.io",
    },
    bb: {
      url: "https://fullnode-mainnet.bouncebitapi.com",
    },
    bob: {
      url: "https://rpc.gobob.xyz",
    },
    kava: {
      url: "https://evm.kava.io",
    },
    kroma: {
      url: "https://api.kroma.network",
    },
    klaytn: {
      url: "https://public-en-cypress.klaytn.net",
    },
    ailayer: {
      url: "https://mainnet-rpc.ailayer.xyz",
    },
    zircuit: {
      url: "https://zircuit-mainnet.drpc.org",
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
