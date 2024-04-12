const { utils } = require('ethers')

const name = 'atomic-lock-mint.Permissions'

const hash = utils.keccak256(utils.hexlify(BigInt(utils.id(name)) - 1n));
console.log(utils.hexlify(BigInt(hash) & ~0xffn))
