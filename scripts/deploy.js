const { ethers } = require('hardhat')

require('dotenv').config()

const {
  PRIVATE_KEY,
  VAULT,
  PROPOSER,
  EXECUTORS,
} = process.env

const CONTRACT_NAME = 'AtomicMintContract' // AtomicLockContract, AtomicMintContract

module.exports = async function deploy() {
  await hre.run('compile')

  const wallet = new ethers.Wallet(PRIVATE_KEY, ethers.provider)
  const admin = wallet.address
  console.log('admin:', admin)

  const vault = ethers.utils.getAddress(VAULT || admin)
  const proposer = ethers.utils.getAddress(PROPOSER)
  const executors = EXECUTORS.split(',').map(addr => ethers.utils.getAddress(addr))

  console.log('proposer:', proposer)
  console.log('executors:', executors)

  console.log(`Deploying ${CONTRACT_NAME}...`)
  const factory = await ethers.getContractFactory(CONTRACT_NAME, wallet)
  const impl = await factory.deploy()
  await impl.deployed()
  console.log(`Implementation deployed at: ${impl.address}`)

  console.log('Deploying Proxy...')
  const data = impl.interface.encodeFunctionData('initialize', [admin, vault, proposer, executors, executors.length])
  const ERC1967Proxy = await ethers.getContractFactory('ERC1967Proxy', wallet)
  const deployed = await ERC1967Proxy.deploy(impl.address, data)
  await deployed.deployed()
  console.log(`${CONTRACT_NAME} deployed to:`, deployed.address)
}
