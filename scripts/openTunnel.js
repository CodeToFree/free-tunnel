require('dotenv').config()
const { ethers } = require('hardhat')
const { getWallet } = require('./lib')

const {
  FREE_TUNNEL_HUB_ADDRESS,
  TUNNEL_NAME,
  PROPOSER,
  EXECUTORS,
} = process.env

module.exports = async function openTunnel(_tunnelName) {
  const tunnelName = _tunnelName || TUNNEL_NAME
  console.log('Opening a new Tunnel:', tunnelName)

  const factory = await ethers.getContractFactory('FreeTunnelHub')
  const hubContract = new ethers.Contract(FREE_TUNNEL_HUB_ADDRESS, factory.interface, getWallet())

  const proposer = ethers.utils.getAddress(PROPOSER)
  const executors = EXECUTORS.split(',').map(addr => ethers.utils.getAddress(addr))

  console.log('proposer:', proposer)
  console.log('executors:', executors)

  const tx = await hubContract.openNewTunnel(tunnelName, true, proposer, executors, 1)
  await tx.wait(1)

  console.log('Tunnel openned:', await hubContract.getTunnelAddress(tunnelName, true))
}
