import { ethers, waffle } from 'hardhat'

import { expect } from './shared/expect'

describe('Permissions', () => {
  let contract: any

  const fixture = async () => {
    const factory = await ethers.getContractFactory('Permissions')
    return (await factory.deploy())
  }

  beforeEach('deploy Permissions', async () => {
    contract = await waffle.loadFixture(fixture)
  })

  describe('#tokenForIndex', () => {
    it('match packed', async () => {
      const executors = [
        '0x666d6b8a44d226150ca9058bEEbafe0e3aC065A2',
        '0x666d6b8a44d226150ca9058bEEbafe0e3aC065A2',
        '0x666d6b8a44d226150ca9058bEEbafe0e3aC065A2'
      ].map(addr => addr.toLowerCase())
      const threshold = 2
      const message = ['Sign to update executors to:', ...executors, `Threshold: ${threshold}`].join('\n')

      expect(await contract.packParameters(executors, threshold)).to.equal(ethers.utils.hashMessage(message))
    })
  })
})
