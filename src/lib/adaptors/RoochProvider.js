import memoize from 'lodash/memoize'
import mapValues from 'lodash/mapValues'
import { BigNumber, utils } from 'ethers'
import {
  RoochClient,
  Transaction as RoochTransaction,
  Args,
  bcs,
  Serializer,
  RoochAddress,
  BitcoinAddress,
} from '@roochnetwork/rooch-sdk'

import { ADDR_ZERO } from '@/lib/const'
import { parseRequest } from '@/lib/request'

import { vectorize, formatMoveAddress } from './utils'

const TREASURY_CAP_MANAGERS = {
  2: '0x978fd0319eb401f9a03748b4aa93fe8623c62392336c5272171cbc7b0270c086'
}

export default class RoochProvider {
  #client
  #signer

  constructor(rpcUrl, signer) {
    this.#client = new RoochClient({ url: rpcUrl })
    this.#signer = signer
  }

  async getBalance (address) {
    const data = await this.#client.getBalance({ owner: address, coinType: '0x3::gas_coin::RGas' })
    return BigNumber.from(data.balance)
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
              if (['name', 'symbol', 'decimals'].includes(prop)) {
                const data = await client.getBalance({ owner: '0x1', coinType: contractAddr })
                return data[prop]
              } else if (prop === 'balanceOf') {
                // args[0] = 'rooch18ncyc4szl0v63j6pq96v8erv7trq6yqyxxzgmre9xa0w7n6pxjqqdneke4'
                const data = await client.getBalance({ owner: args[0], coinType: contractAddr })
                return BigNumber.from(data.balance)
              } else if (prop === 'allowance') {
                return BigNumber.from(2).pow(128).sub(1)
              }

              if (prop === 'getAdmin') {
                const storage = await that._getResource(contractAddr, `${contractAddr}::permissions::PermissionsStorage`)
                const roochAddress = new RoochAddress(storage._admin)
                return roochAddress.toBech32Address()
              } else if (prop === 'getVault') {
                return ADDR_ZERO
              } else if (prop === 'proposerIndex') {
                const storage = await that._getResource(contractAddr, `${contractAddr}::permissions::PermissionsStorage`)
                const roochAddress = new RoochAddress(args[0])
                return BigNumber.from(storage._proposerList.indexOf(roochAddress.toHexAddress()) + 1)
              } else if (prop === 'getActiveExecutors') {
                const storage = await that._getResource(contractAddr, `${contractAddr}::permissions::PermissionsStorage`)
                // console.log(storage)
                const exeIndex = storage._exeActiveSinceForIndex.length - 1
                return {
                  exeIndex: BigNumber.from(exeIndex),
                  activeSince: BigNumber.from(storage._exeActiveSinceForIndex[exeIndex]),
                  executors: storage._executorsForIndex[exeIndex].map(bytes => utils.getAddress(utils.hexlify(bytes))),
                  threshold: BigNumber.from(storage._exeThresholdForIndex[exeIndex]),
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

              const tx = new RoochTransaction()
              const payload = {
                target: `${contractAddr}::${findModuleName(prop)}::${prop}`,
                args: undefined,
                typeArgs: undefined,
              }

              if (prop === 'initExecutors') {
                payload.args = [
                  Args.struct(bcs.vector(bcs.vector(bcs.u8())).serialize(args[0].map(addr => vectorize(addr)))),
                  Args.u64(args[1]),
                ]
              } else if (prop === 'updateExecutors') {
                payload.args = [
                  Args.struct(bcs.vector(bcs.vector(bcs.u8())).serialize(args[0].map(addr => vectorize(addr)))),
                  Args.u64(args[1]),
                  Args.u64(args[2]),
                  Args.struct(bcs.vector(bcs.vector(bcs.u8())).serialize(args[3].map(r => vectorize(r)))),
                  Args.struct(bcs.vector(bcs.vector(bcs.u8())).serialize(args[4].map(yParityAndS => vectorize(yParityAndS)))),
                  Args.struct(bcs.vector(bcs.vector(bcs.u8())).serialize(args[5].map(exe => vectorize(exe)))),
                  Args.u64(args[6]),
                ]
              } else {
                const reqId = args[0]
                const req = parseRequest(reqId)
                const { supportedTokens, indexes, decimals } = await that._getSupportedTokens(contractAddr)
                const i = indexes.findIndex(i => i === req.tokenIndex)
                const tokenAddr = supportedTokens[i]
                const tokenDecimals = decimals[i]
                if (prop === 'proposeMint') {
                  payload.typeArgs = [tokenAddr]
                  payload.args = [
                    Args.vec('u8', vectorize(reqId)),
                    Args.address(args[1]),
                  ]
                } else if (prop === 'executeMint') {
                  console.log(req.tokenIndex)
                  payload.typeArgs = [tokenAddr]
                  payload.args = [
                    Args.vec('u8', vectorize(reqId)),
                    Args.struct(bcs.vector(bcs.vector(bcs.u8())).serialize(args[1].map(r => vectorize(r)))),
                    Args.struct(bcs.vector(bcs.vector(bcs.u8())).serialize(args[2].map(yParityAndS => vectorize(yParityAndS)))),
                    Args.struct(bcs.vector(bcs.vector(bcs.u8())).serialize(args[3].map(exe => vectorize(exe)))),
                    Args.u64(args[4]),
                    Args.objectId(TREASURY_CAP_MANAGERS[req.tokenIndex]),
                  ]
                } else if (prop === 'cancelMint') {
                  payload.typeArgs = [tokenAddr]
                  payload.args = [
                    Args.vec('u8', vectorize(reqId)),
                  ]
                } else if (prop === 'proposeBurn') {
                  payload.typeArgs = [tokenAddr]
                  payload.args = [
                    Args.vec('u8', vectorize(reqId)),
                  ]
                } else if (prop === 'executeBurn') {
                  payload.typeArgs = [tokenAddr]
                  payload.args = [
                    Args.vec('u8', vectorize(reqId)),
                    Args.struct(bcs.vector(bcs.vector(bcs.u8())).serialize(args[1].map(r => vectorize(r)))),
                    Args.struct(bcs.vector(bcs.vector(bcs.u8())).serialize(args[2].map(yParityAndS => vectorize(yParityAndS)))),
                    Args.struct(bcs.vector(bcs.vector(bcs.u8())).serialize(args[3].map(exe => vectorize(exe)))),
                    Args.u64(args[4]),
                    Args.objectId(TREASURY_CAP_MANAGERS[req.tokenIndex]),
                  ]
                } else if (prop === 'cancelBurn') {
                  payload.typeArgs = [tokenAddr]
                  payload.args = [
                    Args.vec('u8', vectorize(reqId)),
                  ]
                }
              }

              tx.callFunction(payload)
              const result = await client.signAndExecuteTransaction({ transaction: tx, signer })

              if (result.execution_info.status.type !== 'executed' && result.execution_info.status) {
                throw new Error('transfer failed' + result.execution_info.status.type)
              }

              return {
                hash: result.execution_info.tx_hash,
                wait: () => result
              }
            }
          }
        }
      }
    })
  }

  _getResource = memoize(async (addr, type) => {
    const result = await this.#client.getStates({
      accessPath: `/resource/${addr}/${type}`, stateOption: { decode: true },
    })
    if (result.length === 0) {
      throw new Error(`resource ${type} not found.`)
    }
    return mapValues(result[0].decoded_value.value.value.value, v => {
      if (v.value) {
        return v.value.handle.value.id
      }
      return v
    })
  }, (addr, type) => `${addr}|${type}`)

  _readTable = async (objectId, type, args) => { // type: 'u8' | 'u64' | 'address' | 'vector<u8>'
    const str = new TextDecoder().decode(args.encode()) + type
    const result = await this.#client.getStates({
      accessPath: `/fields/${objectId}/${Serializer.structTagToObjectID(str)}`,
      stateOption: { decode: true },
    })
    if (result.length === 0) {
      return
    }
    return result[0].decoded_value.value.value
  }

  _getSupportedTokens = memoize(async (contractAddr) => {
    const storage = await this._getResource(contractAddr, `${contractAddr}::req_helpers::ReqHelpersStorage`)

    const indexes = []
    const decimals = []
    const supportedTokens = []
    // '0x3cf04c5602fbd9a8cb410174c3e46cf2c60d100431848d8f25375eef4f413480::hello_rooch3::FSC'
    // '0x701c21bf1c8cd5af8c42983890d8ca55e7a820171b8e744c13f2d9998bf76cc3::grow_bitcoin::GROW'

    for (const i of [1, 2]) {
      const tokenDecimals = await this._readTable(storage.tokenDecimals, 'u8', Args.u8(i))
      if (typeof tokenDecimals !== 'undefined') {
        const { value: { account_address, module_name, struct_name } } = await this._readTable(storage.tokens, 'u8', Args.u8(i))
        const token = `${account_address}::${utils.toUtf8String(module_name)}::${utils.toUtf8String(struct_name)}`
        indexes.push(i)
        decimals.push(tokenDecimals)
        supportedTokens.push(token)
      }
    }

    return { supportedTokens, indexes, decimals }
  })
}


function findModuleName(method) {
  const moduleMethods = {
    atomic_lock: [],
    atomic_mint: [
      'proposeMint',
      'executeMint',
      'cancelMint',
      'proposeBurn',
      'executeBurn',
      'cancelBurn',
    ],
    permissions: [
      'initExecutors',
      'updateExecutors',
    ],
  }

  for (const moduleName of Object.keys(moduleMethods)) {
    if (moduleMethods[moduleName].includes(method)) {
      return moduleName
    }
  }
}
