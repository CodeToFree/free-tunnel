const { ethers } = require('hardhat')

require('dotenv').config()

const {
  PRIVATE_KEY,
  ADDR_PROPOSER,
  ADDR_EXECUTOR,
} = process.env

const CONTRACT_NAME = 'AtomicMintContract' // AtomicLockContract, AtomicMintContract

module.exports = async function deploy() {
  await hre.run('compile')

  const wallet = new ethers.Wallet(PRIVATE_KEY, ethers.provider)
  const admin = wallet.address
  console.log('admin:', admin)

  const proposer = ethers.utils.getAddress(ADDR_PROPOSER)
  const executor = ethers.utils.getAddress(ADDR_EXECUTOR)

  console.log('proposer:', proposer)
  console.log('executor:', executor)

  console.log(`Deploying ${CONTRACT_NAME}...`)
  const factory = await ethers.getContractFactory(CONTRACT_NAME, wallet)
  const impl = await factory.deploy()
  await impl.deployed()
  console.log(`Implementation deployed at: ${impl.address}`)

  console.log('Deploying Proxy...')
  const data = impl.interface.encodeFunctionData('initialize', [admin, proposer, [executor], 1])
  const ERC1967Proxy = await ethers.getContractFactory('ERC1967Proxy', wallet)
  const deployed = await ERC1967Proxy.deploy(impl.address, data)
  await deployed.deployed()
  console.log(`${CONTRACT_NAME} deployed to:`, deployed.address)
}
