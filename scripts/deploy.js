const deployHub = require('./deployHub')
const updateTBM = require('./updateTBM')

module.exports = async function deploy() {
  const hubAddress = await deployHub()
  await updateTBM(hubAddress)
}
