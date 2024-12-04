require('dotenv').config()
const { ethers } = require('hardhat')
const { getWallet } = require('./lib')

const {
  FREE_TUNNEL_HUB_ADDRESS,
  TUNNEL_NAME,
  IS_LOCK_MODE,
  ADMIN,
  PROPOSER,
  EXECUTORS,
} = process.env

module.exports = async function openTunnel() {
  let isLockMode
  if (IS_LOCK_MODE === 'true') {
    isLockMode = true
  } else if (IS_LOCK_MODE === 'false') {
    isLockMode = false
  } else {
    throw new Error('Invalid IS_LOCK_MODE')
  }
  console.log('Opening a new Tunnel:', TUNNEL_NAME, isLockMode)

  const admin = ethers.utils.getAddress(ADMIN)
  const proposer = ethers.utils.getAddress(PROPOSER)
  const executors = EXECUTORS.split(',').map(addr => ethers.utils.getAddress(addr))
  const threshold = Math.floor(executors.length / 2) + 1

  console.log('admin:', admin)
  console.log('proposer:', proposer)
  console.log('executors:', executors)
  console.log('threshold:', threshold)

  const hubContract = await ethers.getContractAt('FreeTunnelHub', FREE_TUNNEL_HUB_ADDRESS, getWallet())

  const tx = await hubContract.openNewTunnel(TUNNEL_NAME, isLockMode, admin, proposer, executors, threshold)
  await tx.wait(1)

  console.log('Tunnel opened:', await hubContract.getTunnelAddress(TUNNEL_NAME, isLockMode))
}
