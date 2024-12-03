require('dotenv').config()
const { ethers } = require('hardhat')
const { getWallet } = require('./lib')
const deployTBM = require('./deployTBM')

const {
  FREE_TUNNEL_HUB_ADDRESS,
} = process.env

module.exports = async function updateTBM(version) {
  const tbmAddress = await deployTBM(version)

  const factory = await ethers.getContractFactory('FreeTunnelHub')
  const hubContract = new ethers.Contract(FREE_TUNNEL_HUB_ADDRESS, factory.interface, getWallet())

  await hubContract.updateTunnelBoringMachine(tbmAddress)
  console.log(`TunnelBoringMachine Updated.`)
}
