require('dotenv').config()
const { ethers } = require('hardhat')
const { getWallet, deployContract } = require('./lib')

const {
  FREE_TUNNEL_HUB_ADDRESS,
} = process.env

module.exports = async function upgradeHub() {
  await hre.run('compile')

  const chainConfig = require(`../src/lib/const/chains/${hre.network.name}.json`)
  const impl = await deployContract('FreeTunnelHub', [chainConfig.hubId])

  console.log('Upgrading FreeTunnelHub...')
  const proxy = new ethers.Contract(FREE_TUNNEL_HUB_ADDRESS, impl.interface, getWallet())
  await proxy.upgradeToAndCall(impl.address, '0x')
  console.log(`FreeTunnelHub Upgraded.`)
}
