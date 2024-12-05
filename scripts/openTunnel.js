require('dotenv').config()
const { ethers } = require('hardhat')
const { getWallet } = require('./lib')

const {
  FREE_TUNNEL_HUB_ADDRESS,
  TUNNEL_NAME,
  IS_LOCK_MODE,
  SIGNATURE,
  PK_ADMIN,
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
  console.log('Opening a new Tunnel:', TUNNEL_NAME, isLockMode ? '(Lock Mode)' : '(Mint Mode)')

  const adminWallet = getWallet(PK_ADMIN)
  const proposer = ethers.utils.getAddress(PROPOSER)
  const executors = EXECUTORS.split(',').map(addr => ethers.utils.getAddress(addr))
  const threshold = Math.floor(executors.length / 2) + 1

  console.log('admin:', adminWallet.address)
  console.log('proposer:', proposer)
  console.log('executors:', executors)
  console.log('threshold:', threshold)

  let until, signature
  if (SIGNATURE) {
    [until, signature] = SIGNATURE.split(':')
  } else {
    until = Math.floor(Date.now() / 1000) + 86400 * 7 // expires in 7 days
    const message = [
      `FreeTunnelHub at ${FREE_TUNNEL_HUB_ADDRESS.toLowerCase()} allows ${adminWallet.address.toLowerCase()} to open the tunnel:`,
      TUNNEL_NAME,
      `Until: ${until}`
    ].join('\n')
    signature = await getWallet().signMessage(message)
    console.log('signature:', `${until}:${signature}`)
  }

  const hubContract = await ethers.getContractAt('FreeTunnelHub', FREE_TUNNEL_HUB_ADDRESS, adminWallet)
  const { r, yParityAndS } = ethers.utils.splitSignature(signature)
  const tx = await hubContract.openNewTunnel(TUNNEL_NAME, isLockMode, r, yParityAndS, until, executors, threshold, proposer)
  await tx.wait(1)

  console.log('Tunnel opened:', await hubContract.getTunnelAddress(TUNNEL_NAME, isLockMode))
}
