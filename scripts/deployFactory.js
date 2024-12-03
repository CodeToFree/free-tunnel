const { getWallet, deployContract } = require('./lib')

require('dotenv').config()

const CONTRACT_NAME = 'FreeTunnelFactory'

module.exports = async function deploy() {
  await hre.run('compile')

  const impl = await deployContract(CONTRACT_NAME, ['0x00'])

  const data = impl.interface.encodeFunctionData('initialize', [])
  await deployContract('ERC1967Proxy', [impl.address, data])
}
