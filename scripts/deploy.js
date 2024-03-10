const { ethers } = require('hardhat')

require('dotenv').config()

const {
  PRIVATE_KEY,
} = process.env

const CONTRACT_NAME = ''

module.exports = async function deploy() {
  await hre.run('compile')

  const wallet = new ethers.Wallet(PRIVATE_KEY, ethers.provider)
  const admin = wallet.address
  console.log('admin:', admin)

  // ethers.utils.getAddress()

  const factory = await ethers.getContractFactory(CONTRACT_NAME, wallet)
  const impl = await factory.deploy()
  await impl.deployed()
  console.log(`Implementation deployed at: ${impl.address}`)

  console.log('Deploying Proxy...')
  const data = impl.interface.encodeFunctionData('initialize', [admin])
  const ERC1967Proxy = await ethers.getContractFactory('ERC1967Proxy', wallet)
  const deployed = await ERC1967Proxy.deploy(impl.address, data)
  await deployed.deployed()
  console.log(`${CONTRACT_NAME} deployed to:`, deployed.address)
}
