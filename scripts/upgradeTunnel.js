require('dotenv').config()
const { ethers } = require('hardhat')
const { getWallet } = require('./lib')

const {
  FREE_TUNNEL_HUB_ADDRESS,
  TUNNEL_NAME,
} = process.env

module.exports = async function upgradeTunnel(_tunnelName) {
  const tunnelName = _tunnelName || TUNNEL_NAME
  console.log('Upgrading a Tunnel:', tunnelName)

  const factory = await ethers.getContractFactory('FreeTunnelHub')
  const hubContract = new ethers.Contract(FREE_TUNNEL_HUB_ADDRESS, factory.interface, getWallet())

  await hubContract.upgradeTunnel(tunnelName, true)
  console.log(`TunnelContract Upgraded.`)
}
