const { ethers } = require('hardhat')
const { Wallet: ZkWallet } = require('zksync-ethers')
const { Deployer } = require('@matterlabs/hardhat-zksync-deploy')

require('dotenv').config()
const { PRIVATE_KEY } = process.env

function getWallet() {
  if (['zksync', 'zklink'].includes(hre.network.name)) {
    return new ZkWallet(PRIVATE_KEY)
  } else {
    return new ethers.Wallet(PRIVATE_KEY, ethers.provider)
  }
}
exports.getWallet = getWallet

exports.deployContract = async function deployContract(contractName, args) {
  const wallet = getWallet()
  console.log(`Deploying ${contractName} by ${wallet.address}...`)

  let deployed
  if (['zksync', 'zklink'].includes(hre.network.name)) {
    const deployer = new Deployer(hre, wallet)
    const artifact = await deployer.loadArtifact(contractName)
    deployed = await deployer.deploy(artifact, args)
  } else {
    const factory = await ethers.getContractFactory(contractName, wallet)
    deployed = await factory.deploy(...args)
    await deployed.deployed()
  }
  console.log(`${contractName} deployed at: ${deployed.address}`)
  return deployed
}
