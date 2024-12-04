require('dotenv').config()
const { ethers } = require('hardhat')
const { getWallet } = require('./lib')

const {
  TBM_VERSION,
  FREE_TUNNEL_HUB_ADDRESS,
} = process.env

module.exports = async function updateTBM(_hubAddress) {
  await hre.run('compile')

  const hubAddress = _hubAddress || FREE_TUNNEL_HUB_ADDRESS

  const wallet = getWallet()
  const hubContract = await ethers.getContractAt('FreeTunnelHub', hubAddress, wallet)

  const TunnelBoringMachine = await ethers.getContractFactory('TunnelBoringMachine', wallet)
  const tx = await hubContract.updateTunnelBoringMachine(+TBM_VERSION, TunnelBoringMachine.bytecode)
  await tx.wait()

  console.log('TunnelBoringMachine updated:', await hubContract.currentTBM())
}
