require('dotenv').config()
const { ethers } = require('hardhat')
const { getWallet } = require('./lib')

const {
  TBM_VERSION,
  TUNNEL_ADDRESS,
} = process.env

module.exports = async function upgradeTunnel() {
  console.log('Upgrading a Tunnel:', TUNNEL_ADDRESS)

  const tunnel = await ethers.getContractAt('TunnelContract', TUNNEL_ADDRESS, getWallet())

  await tunnel.upgradeTunnel(+TBM_VERSION)
  console.log(`TunnelContract Upgraded.`)
}
