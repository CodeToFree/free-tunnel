const { ethers } = require('hardhat')

require('dotenv').config()

const {
  PRIVATE_KEY,
} = process.env

const CONTRACT_NAME = 'AtomicLockContract' // AtomicLockContract, AtomicMintContract

module.exports = async function upgrade() {
  await hre.run('compile')

  const networkConfig = require(`../src/lib/const/chains/${hre.network.name}.json`)

  const wallet = new ethers.Wallet(PRIVATE_KEY, ethers.provider)
  const admin = wallet.address
  console.log('admin:', admin)

  const factory = await ethers.getContractFactory(CONTRACT_NAME, wallet)
  const impl = await factory.deploy()
  await impl.deployed()
  console.log(`Implementation deployed at: ${impl.address}`)

  console.log('Upgrading...')
  const abi = JSON.parse(impl.interface.format('json'))
  const proxy = new ethers.Contract(networkConfig[CONTRACT_NAME], abi, wallet)
  await proxy.upgradeToAndCall(impl.address, '0x')
  console.log(`${CONTRACT_NAME} Upgraded.`)
}
