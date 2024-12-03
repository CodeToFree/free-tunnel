const deployTBM = require('./deployTBM')
const deployHub = require('./deployHub')

const version = 20241203

module.exports = async function deploy() {
  const tbmAddress = await deployTBM(version)
  await deployHub(tbmAddress)
}
