import memoize from 'lodash/memoize'
import { BigNumber, utils } from 'ethers'
import { SuiClient } from '@mysten/sui/client'
import { Transaction as SuiTransaction } from '@mysten/sui/transactions'
import { bcs } from '@mysten/sui/bcs'

import { ADDR_ZERO } from '@/lib/const'
import { parseRequest } from '@/lib/request'

import { vectorize, formatMoveAddress } from './utils'

const METADATA = {
  '0x6f860a2558e084e82f077c939adfcda8fc841ed48f758e0e537592d8202c7644': {
    storeA: '0x1a7010aed540cf4c4ac452160c6cee6fa09b4f8ae25ad5e314dd413a15d0005f',
    storeP: '0x0384b1aee13c22ad5f14355c1dbd7a5028c5a82c1f708e9c39ac0d518d6663f9',
    storeR: '0x21990596a674400ae1e3cfd557a9747465d61fdbf0735a4563d09a347ae59ab6',
    treasuryCapManager: '0x2d9c3f6c6bcf2125f5f3a71126b437ce6e9aa7851c226fdf6a3d643970b6f5eb',
  },
  '0x149a2bf0705a09f7115d79b97657e9a06b3af56cb85ef99eed1283e08ae70030': {
    storeA: '0x588d57e40b8b635c39a03768ba407ebb1b9b0fb37299f82e1fcef019efb9c4b6',
    storeP: '0xe7cdd337457a627ce5735426ed4a67ab1b4bb689145e91fbd2c34dc98de49285',
    storeR: '0x8ce045d3423f0b70f3745426d2f8cc2d2ddbc9096db06b0c2d10b02872b10eb0',
    treasuryCapManager: '0x8fe24030d80dd52f9ec65793adb2046a58c1a93cbac9288b812babfcf1bb6f36',
    accessConfig: '0xdcdec5b454a1033ece15af203c8bf39bc8b84b8c24511d66991a823046f417f8'
  }
}

export default class SuiProvider {
  #client
  #signer

  constructor(rpcUrl, signer) {
    this.#client = new SuiClient({ url: rpcUrl })
    this.#signer = signer
  }

  async getBalance (address) {
    const data = await this.#client.getBalance({ owner: address })
    return BigNumber.from(data.totalBalance)
  }

  getContract (contractAddr, abi) {
    const that = this
    const client = this.#client
    const signer = this.#signer
    return new Proxy({}, {
      get(target, prop) {
        if (prop === 'address') {
          return contractAddr
        }
        let method = abi.find(item => item.name === prop)
        if (method?.type === 'function') {
          if (['view', 'pure'].includes(method.stateMutability)) {
            return async (...args) => {
              let options
              if (args.length > method.inputs.length) {
                options = args.pop()
              }

              // ERC20 like
              if (prop === 'name') {
                const data = await client.getCoinMetadata({ coinType: contractAddr })
                return data.name
              } else if (prop === 'symbol') {
                const data = await client.getCoinMetadata({ coinType: contractAddr })
                return data.symbol
              } else if (prop === 'decimals') {
                const data = await client.getCoinMetadata({ coinType: contractAddr })
                return data.decimals
              } else if (prop === 'balanceOf') {
                const data = await client.getBalance({ owner: args[0], coinType: contractAddr })
                return BigNumber.from(data.totalBalance)
              } else if (prop === 'allowance') {
                return BigNumber.from(2).pow(128).sub(1)
              }

              if (prop === 'getAdmin') {
                const data = await that._getObject(METADATA[contractAddr].storeP)
                return data._admin
              } else if (prop === 'getVault') {
                return ADDR_ZERO
              } else if (prop === 'proposerIndex') {
                const data = await that._getDynamicFieldValue(METADATA[contractAddr].storeP, '_proposerIndex', 'address', args[0])
                return BigNumber.from(data)
              } else if (prop === 'getActiveExecutors') {
                const {
                  _exeActiveSinceForIndex,
                  _executorsForIndex,
                  _exeThresholdForIndex,
                } = await that._getObject(METADATA[contractAddr].storeP)
                const exeIndex = _exeActiveSinceForIndex.length - 1
                return {
                  exeIndex: BigNumber.from(exeIndex),
                  activeSince: BigNumber.from(_exeActiveSinceForIndex[exeIndex]),
                  executors: _executorsForIndex[exeIndex].map(bytes => utils.getAddress(utils.hexlify(bytes))),
                  threshold: BigNumber.from(_exeThresholdForIndex[exeIndex]),
                }
              }

              if (prop === 'getSupportedTokens') {
                return await that._getSupportedTokens(contractAddr)
              }
            }
          } else {
            return async (...args) => {
              let options
              if (args.length > method.inputs.length) {
                options = args.pop()
              }

              const txb = new SuiTransaction()
              const payload = {
                target: `${contractAddr}::${findModuleName(prop)}::${prop}`,
                arguments: undefined,
                typeArguments: undefined,
              }

              console.log('args:', args)
              const reqId = args[0]
              const req = parseRequest(reqId)
              const { supportedTokens, indexes, decimals } = await that._getSupportedTokens(contractAddr)
              const i = indexes.findIndex(i => i === req.tokenIndex)
              const tokenAddr = supportedTokens[i]
              const tokenDecimals = decimals[i]
              console.log('req:', req)
              if (prop === 'proposeMint') {
                payload.typeArguments = [tokenAddr]
                payload.arguments = [
                  txb.pure(vectorize(reqId)),
                  txb.pure(args[1]),
                  txb.object(METADATA[contractAddr].storeA),
                  txb.object(METADATA[contractAddr].storeP),
                  txb.object(METADATA[contractAddr].storeR),
                  txb.object('0x6'),
                ]
              } else if (prop === 'executeMint') {
                payload.typeArguments = [tokenAddr]
                payload.arguments = [
                  txb.pure(vectorize(reqId)),
                  txb.pure(bcs.vector(bcs.vector(bcs.u8())).serialize(args[1].map(r => vectorize(r)))),
                  txb.pure(bcs.vector(bcs.vector(bcs.u8())).serialize(args[2].map(s => vectorize(s)))),
                  txb.pure(bcs.vector(bcs.vector(bcs.u8())).serialize(args[3].map(exe => vectorize(exe)))),
                  txb.pure(BigNumber.from(args[4]).toHexString()),
                  txb.object(METADATA[contractAddr].accessConfig),
                  txb.object(METADATA[contractAddr].treasuryCapManager),
                  txb.object(METADATA[contractAddr].storeA),
                  txb.object(METADATA[contractAddr].storeP),
                  txb.object(METADATA[contractAddr].storeR),
                  txb.object('0x6'),
                ]
              } else if (prop === 'proposeBurn') {
                const coinList = await that._pickCoinObjects(tokenAddr, utils.parseUnits(req.value, tokenDecimals))
                payload.typeArguments = [tokenAddr]
                payload.arguments = [
                  txb.pure(vectorize(reqId)),
                  txb.makeMoveVec({ objects: coinList.map(obj => txb.object(obj.coinObjectId)) }),
                  txb.object(METADATA[contractAddr].storeA),
                  txb.object(METADATA[contractAddr].storeR),
                  txb.object('0x6'),
                ]
              } else if (prop === 'executeBurn') {
                payload.typeArguments = [tokenAddr]
                payload.arguments = [
                  txb.pure(vectorize(reqId)),
                  txb.pure(bcs.vector(bcs.vector(bcs.u8())).serialize(args[1].map(r => vectorize(r)))),
                  txb.pure(bcs.vector(bcs.vector(bcs.u8())).serialize(args[2].map(s => vectorize(s)))),
                  txb.pure(bcs.vector(bcs.vector(bcs.u8())).serialize(args[3].map(exe => vectorize(exe)))),
                  txb.pure(BigNumber.from(args[4]).toHexString()),
                  txb.object(METADATA[contractAddr].accessConfig),
                  txb.object(METADATA[contractAddr].treasuryCapManager),
                  txb.object(METADATA[contractAddr].storeA),
                  txb.object(METADATA[contractAddr].storeP),
                  txb.object(METADATA[contractAddr].storeR),
                  txb.object('0x6'),
                ]
              }

              console.log(payload)
              txb.moveCall(payload)
              const feat = signer.features['sui:signAndExecuteTransactionBlock']
              const result = await feat.signAndExecuteTransactionBlock({ transactionBlock: txb })
              return {
                hash: result.digest,
                wait: () => this._wrapSuiTx(result)
              }
            }
          }
        }
      }
    })
  }

  _getMetadata = memoize(async (contractAddr) => {
    const obj = await this.#client.getObject({ id: contractAddr, options: { showPreviousTransaction: true } })
    const result = await this.#client.getTransactionBlock({ digest: obj.data.previousTransaction, options: { showObjectChanges: true } })
    const upgradeCap = result.objectChanges.find(obj => obj.objectType === '0x2::package::UpgradeCap')

    // TODO
  })


  _getObject = memoize(async (objectId) => {
    try {
      const res = await this.#client.getObject({ id: objectId, options: { showContent: true } })
      return res.data.content.fields
    } catch (e) {
      throw e
    }
  })

  _getDynamicFields = async (storeObjectId, key) => {
    const store = await this._getObject(storeObjectId)
    try {
      const res = await this.#client.getDynamicFields({ parentId: store[key].fields.id.id })
      return res.data
    } catch (e) {
      throw e
    }
  }


  _getDynamicFieldValue = async (storeObjectId, key, fieldType, fieldValue) => {
    const store = await this._getObject(storeObjectId)
    try {
      const res = await this.#client.getDynamicFieldObject({ parentId: store[key].fields.id.id, name: { type: fieldType, value: fieldValue } })
      if (res.error?.code === 'dynamicFieldNotFound') {
        return
      }
      return res?.data.content.fields.value
    } catch (e) {
      console.warn(e)
      if (e.cause.message?.includes('Cannot find dynamic field')) {
        return
      }
      throw e
    }
  }

  _getSupportedTokens = memoize(async (contractAddr) => {
    const addressData = await this._getDynamicFields(METADATA[contractAddr].storeR, 'tokens')
    const decimalsData = await this._getDynamicFields(METADATA[contractAddr].storeR, 'tokenDecimals')
    const sortedAddressData = addressData.sort((x, y) => Number(x.name.value) - Number(y.name.value))
    const sortedDecimalsData = decimalsData.sort((x, y) => Number(x.name.value) - Number(y.name.value))
    const supportedTokens = []
    const indexes = []
    const decimals = []
    for (const item of sortedAddressData) {
      const obj = await this._getObject(item.objectId)
      indexes.push(Number(item.name.value))
      supportedTokens.push(formatMoveAddress(obj.value.fields.name))
    }
    for (const item of sortedDecimalsData) {
      const obj = await this._getObject(item.objectId)
      decimals.push(obj.value)
    }
    return { supportedTokens, indexes, decimals }
  })

  _pickCoinObjects = async (tokenAddr, amount) => {
    const coins = await this.#client.getCoins({
      owner: this.#signer.accounts[0],
      coinType: tokenAddr,
    })
    const bnAmount = BigNumber.from(amount)
    const enoughCoins = coins.data.find(obj => bnAmount.lte(obj.balance))
    if (enoughCoins) {
      return [enoughCoins]
    }

    const pickedCoins = []
    let mergedAmount = BigNumber.from(0)
    for (const obj of coins.data) {
      pickedCoins.push(obj)
      mergedAmount = mergedAmount.add(obj.balance)
      if (mergedAmount.gte(bnAmount)) {
        return pickedCoins
      }
    }
    throw new Error(`Insufficient balance: ${tokenAddr}.`)
  }
}


function findModuleName(method) {
  const moduleMethods = {
    atomic_mint: [
      'proposeMint',
      'executeMint',
      'proposeBurn',
      'executeBurn',
    ],
    atomic_lock: [],
  }

  for (const moduleName of Object.keys(moduleMethods)) {
    if (moduleMethods[moduleName].includes(method)) {
      return moduleName
    }
  }
}
