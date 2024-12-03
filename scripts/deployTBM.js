const { deployContract } = require('./lib')

module.exports = async function deployTBM(version) {
  if (!version) {
    throw new Error('Requires a version number for TBM (-v)')
  } else if (!Number.isInteger(+version) || version < 1) {
    throw new Error('Invalid version number (-v)')
  }

  await hre.run('compile')

  const deployed = await deployContract('TunnelBoringMachine', [+version])
  return deployed.address
}
