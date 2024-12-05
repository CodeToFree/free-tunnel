require('dotenv').config()
const { ethers } = require('hardhat')
const { getWallet } = require('./lib')

const {
  TUNNEL_ADDRESS,
  PK_ADMIN,
} = process.env

const tokenIndex = 0
const tokenAddr = ''

module.exports = async function addToken() {
  console.log('Add token to Tunnel at', TUNNEL_ADDRESS)

  const tunnel = await ethers.getContractAt('TunnelContract', TUNNEL_ADDRESS, getWallet(PK_ADMIN))

  await tunnel.addToken(tokenIndex, tokenAddr)
  console.log(`Token added.`)
}
