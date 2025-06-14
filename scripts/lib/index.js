const { ethers } = require('hardhat')
const { Wallet: ZkWallet } = require('zksync-ethers')
const { Deployer } = require('@matterlabs/hardhat-zksync-deploy')

const CustomGasFeeProviderWrapper = require('./CustomGasFeeProviderWrapper')

require('dotenv').config()
const { PRIVATE_KEY } = process.env

function getWallet(privateKey) {
  if (['zksync', 'zklink'].includes(hre.network.name)) {
    return new ZkWallet(privateKey || PRIVATE_KEY)
  } else {
    ethers.provider = new CustomGasFeeProviderWrapper(ethers.provider)
    return new ethers.Wallet(privateKey || PRIVATE_KEY, ethers.provider)
  }
}
exports.getWallet = getWallet

exports.deployContract = async function deployContract(contractName, args = [], opt) {
  const wallet = getWallet()
  console.log(`Deploying ${contractName} by ${wallet.address}...`)

  let deployed
  if (['zksync', 'zklink'].includes(hre.network.name)) {
    const deployer = new Deployer(hre, wallet)
    const artifact = await deployer.loadArtifact(contractName)
    deployed = await deployer.deploy(artifact, args, opt)
  } else {
    const factory = await ethers.getContractFactory(contractName, wallet)
    deployed = await factory.deploy(...args, opt)
    await deployed.deployed()
  }
  console.log(`${contractName} deployed at: ${deployed.address}`)
  return deployed
}
