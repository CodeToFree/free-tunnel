const { ethers } = require('hardhat')
const { getWallet, deployContract } = require('./lib')

require('dotenv').config()

const {
  VAULT,
  PROPOSER,
  EXECUTORS,
} = process.env

const ADDR_ZERO = '0x0000000000000000000000000000000000000000'
const CONTRACT_NAME = 'AtomicMintContract' // AtomicMintContract or AtomicLockContract

module.exports = async function deploy() {
  await hre.run('compile')

  const admin = getWallet().address
  const vault = ethers.utils.getAddress(VAULT || ADDR_ZERO)
  const proposer = ethers.utils.getAddress(PROPOSER)
  const executors = EXECUTORS.split(',').map(addr => ethers.utils.getAddress(addr))

  console.log('admin:', admin)
  console.log('vault:', vault)
  console.log('proposer:', proposer)
  console.log('executors:', executors)

  const impl = await deployContract(CONTRACT_NAME, [])

  const data = impl.interface.encodeFunctionData('initialize', [admin, vault, proposer, executors, 2])
  console.log(data) // remove
  await deployContract('ERC1967Proxy', [impl.address, data])
}
