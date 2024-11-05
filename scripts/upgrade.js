const { ethers } = require('hardhat')
const { deployContract } = require('./lib')

require('dotenv').config()

const {
  NEXT_PUBLIC_CONTRACT_ADDRS,
} = process.env

const CONTRACT_NAME = 'AtomicMintContract' // AtomicMintContract or AtomicLockContract

module.exports = async function upgrade() {
  await hre.run('compile')

  const proxyAddress = JSON.parse(NEXT_PUBLIC_CONTRACT_ADDRS)[hre.network.name]
  if (!proxyAddress) {
    throw new Error('No proxy address')
  }

  const impl = await deployContract(CONTRACT_NAME, [])

  console.log('Upgrading...')
  const abi = JSON.parse(impl.interface.format('json'))
  const proxy = new ethers.Contract(proxyAddress, abi, wallet)
  await proxy.upgradeToAndCall(impl.address, '0x')
  console.log(`${CONTRACT_NAME} Upgraded.`)
}
