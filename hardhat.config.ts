import '@nomiclabs/hardhat-ethers'
import '@nomiclabs/hardhat-waffle'
import '@matterlabs/hardhat-zksync-deploy'
import '@matterlabs/hardhat-zksync-solc'
import '@matterlabs/hardhat-zksync-verify'

import { task } from 'hardhat/config'

import config from './config.json'

task('deploy', 'Deploy')
  .setAction(async () => {
    const deploy = require('./scripts/deploy')
    await deploy()
  })

task('deploy-hub', 'Deploy FreeTunnelHub')
  .setAction(async () => {
    const deploy = require('./scripts/deployHub')
    await deploy()
  })

task('update-tbm', 'Update TunnelBoringMachine')
  .setAction(async () => {
    const updateTBM = require('./scripts/updateTBM')
    await updateTBM()
  })

task('open-tunnel', 'Open a new Tunnel')
  .setAction(async () => {
    const openTunnel = require('./scripts/openTunnel')
    await openTunnel()
  })

task('upgrade-tunnel', 'Upgrade Tunnel')
  .setAction(async () => {
    const upgrade = require('./scripts/upgradeTunnel')
    await upgrade()
  })

task('upgrade-hub', 'Upgrade FreeTunnelHub')
  .setAction(async () => {
    const upgrade = require('./scripts/upgradeHub')
    await upgrade()
  })

task('update-quota', 'Update Mint Quota')
  .setAction(async () => {
    const updateMintQuota = require('./scripts/updateMintQuota')
    await updateMintQuota()
  })

task('add-token', 'Add Token')
  .setAction(async () => {
    const addToken = require('./scripts/addToken')
    await addToken()
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
    version: '1.5.11',
    compilerSource: 'binary',
    settings: {},
  },
  defaultNetwork: 'eth',
  networks: {
    eth: {
      url: 'https://eth.llamarpc.com',
    },
    arb: {
      url: 'https://arb1.arbitrum.io/rpc',
    },
    bnb: {
      url: 'https://binance.llamarpc.com',
    },
    polygon: {
      url: 'https://polygon-rpc.com',
    },
    opt: {
      url: 'https://rpc.ankr.com/optimism',
    },
    avax: {
      url: 'https://api.avax.network/ext/bc/C/rpc',
    },
    base: {
      url: 'https://mainnet.base.org',
    },
    linea: {
      url: 'https://rpc.linea.build',
    },
    zksync: {
      url: 'https://mainnet.era.zksync.io',
      zksync: true,
      ethNetwork: 'eth',
      verifyURL: 'https://zksync2-mainnet-explorer.zksync.io/contract_verification',
    },
    scroll: {
      url: 'https://rpc.scroll.io',
    },
    mode: {
      url: 'https://mainnet.mode.network',
    },
    manta: {
      url: 'https://pacific-rpc.manta.network/http',
    },
    zklink: {
      url: 'https://rpc.zklink.io',
      zksync: true,
      ethNetwork: 'eth',
      verifyURL: 'https://explorer.zklink.io/contract_verification',
    },
    core: {
      url: 'https://rpc.coredao.org',
    },
    xlayer: {
      url: 'https://rpc.xlayer.tech',
    },
    mantle: {
      url: 'https://rpc.mantle.xyz',
    },
    merlin: {
      url: 'https://rpc.merlinchain.io',
    },
    b2: {
      url: 'https://rpc.bsquared.network',
    },
    bitlayer: {
      url: 'https://rpc.bitlayer.org',
    },
    bevm: {
      url: 'https://rpc-mainnet-1.bevm.io',
    },
    bb: {
      url: 'https://fullnode-mainnet.bouncebitapi.com',
    },
    bob: {
      url: 'https://rpc.gobob.xyz',
    },
    opbnb: {
      url: 'https://opbnb-mainnet-rpc.bnbchain.org',
    },
    sonic: {
      url: 'https://rpc.soniclabs.com',
    },
    cfx: {
      url: 'https://evm.confluxrpc.com',
    },
    neox: {
      url: 'https://mainnet-1.rpc.banelabs.org',
    },
    soneium: {
      url: 'https://rpc.soneium.org',
    },
    kava: {
      url: 'https://evm.kava.io',
    },
    kroma: {
      url: 'https://api.kroma.network',
    },
    kaia: {
      url: 'https://public-en.node.kaia.io',
    },
    ailayer: {
      url: 'https://mainnet-rpc.ailayer.xyz',
    },
    zircuit: {
      url: 'https://zircuit-mainnet.drpc.org',
    },
    iotex: {
      url: 'https://babel-api.mainnet.iotex.io',
    },
    zeta: {
      url: 'https://zetachain-evm.blockpi.network:443/v1/rpc/public'
    },
    taiko: {
      url: 'https://rpc.mainnet.taiko.xyz'
    },
    sei: {
      url: 'https://evm-rpc.sei-apis.com'
    },
    duck: {
      url: 'https://rpc.duckchain.io'
    },
    morph: {
      url: 'https://rpc.morphl2.io'
    },
    exsat: {
      url: 'https://evm.exsat.network'
    },
    hemi: {
      url: 'https://7e57304f.rpc.hemi.network/rpc'
    },
    corn: {
      url: 'https://maizenet-rpc.usecorn.com'
    },
    lisk: {
      url: 'https://rpc.api.lisk.com'
    },
    taker: {
      url: 'https://rpc-mainnet.taker.xyz'
    },
    rsk: {
      url: 'https://rootstock-mainnet.public.blastapi.io'
    },
    sepolia: {
      url: 'https://eth-sepolia.public.blastapi.io',
    },
    merlin_testnet: {
      url: 'https://testnet-rpc.merlinchain.io',
    },
    b2_testnet: {
      url: 'https://haven-rpc.bsquared.network',
    },
    hype_testnet: {
      url: 'https://api.hyperliquid-testnet.xyz/evm',
    },
  }
}

export default hardhatConfig
