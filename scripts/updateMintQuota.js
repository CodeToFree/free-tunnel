const { ethers } = require('hardhat')

require('dotenv').config()

const {
  PRIVATE_KEY,
} = process.env

const MintableERC20 = require('../artifacts/contracts/mint/MintableERC20.sol/MintableERC20.json')

const tokenAddr = ''
const quotaToAdd = ethers.utils.parseUnits('10000', 6)

module.exports = async function updateMintQuota() {
  const wallet = new ethers.Wallet(PRIVATE_KEY, ethers.provider)
  const vault = wallet.address
  console.log('vault:', vault)

  const token = new ethers.Contract(tokenAddr, MintableERC20.abi, wallet)

  console.log('Updating Mint Quota...')
  await token.updateMintQuota(quotaToAdd)
  console.log(`Quota Added!`)
}
