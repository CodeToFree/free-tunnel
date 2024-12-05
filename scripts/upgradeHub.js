require('dotenv').config()
const { ethers } = require('hardhat')
const { getWallet } = require('./lib')

const {
  FREE_TUNNEL_HUB_ADDRESS,
} = process.env

module.exports = async function upgradeHub() {
  await hre.run('compile')

  const wallet = getWallet()
  const FreeTunnelHub = await ethers.getContractFactory('FreeTunnelHub', wallet)
  const hubContract = new ethers.Contract(FREE_TUNNEL_HUB_ADDRESS, FreeTunnelHub.interface, wallet)

  await hubContract.upgrade(FreeTunnelHub.bytecode)

  console.log(`FreeTunnelHub upgraded!`)
}
