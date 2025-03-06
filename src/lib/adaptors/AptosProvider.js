import memoize from 'lodash/memoize'
import { BigNumber, utils } from 'ethers'
import { Aptos, AptosConfig } from '@aptos-labs/ts-sdk'

import { ADDR_ZERO } from '@/lib/const'
import { parseRequest } from '@/lib/request'

export default class AptosProvider {
  #client
  #signer

  constructor(rpcUrl, signer) {
    const config = new AptosConfig({ fullnode: rpcUrl })
    this.#client = new Aptos(config)
    this.#signer = signer
  }

  async getBalance (address) {
    const type = `0x1::coin::CoinStore<0x1::aptos_coin::AptosCoin>`
    try {
      const result = await this.#client.getAccountResource({ accountAddress: address, resourceType: type })
      return BigNumber.from(result.coin.value)
    } catch (e) {
      if (e.data?.error_code === 'resource_not_found') {
        return BigNumber.from(0)
      }
      throw e
    }
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
                const metadata = await that._getResource(contractAddr, `0x1::fungible_asset::Metadata`)
                return metadata.name
              } else if (prop === 'symbol') {
                const metadata = await that._getResource(contractAddr, `0x1::fungible_asset::Metadata`)
                return metadata.symbol
              } else if (prop === 'decimals') {
                const metadata = await that._getResource(contractAddr, `0x1::fungible_asset::Metadata`)
                return metadata.decimals
              } else if (prop === 'balanceOf') {
                const payload = {
                  function: '0x1::primary_fungible_store::balance',
                  typeArguments: ['0x1::fungible_asset::Metadata'],
                  functionArguments: [args[0], contractAddr],
                }
                const data = await client.view({ payload })
                return BigNumber.from(data?.[0] || 0)
              } else if (prop === 'allowance') {
                return BigNumber.from(2).pow(128).sub(1)
              }

              if (prop === 'getAdmin') {
                const storage = await that._getResource(contractAddr, `${contractAddr}::permissions::PermissionsStorage`)
                return formatAddress(storage._admin)
              } else if (prop === 'getVault') {
                return ADDR_ZERO
              } else if (prop === 'proposerIndex') {
                const storage = await that._getResource(contractAddr, `${contractAddr}::permissions::PermissionsStorage`)
                return BigNumber.from(storage._proposerList.map(formatAddress).indexOf(args[0]) + 1)
              } else if (prop === 'getActiveExecutors') {
                const storage = await that._getResource(contractAddr, `${contractAddr}::permissions::PermissionsStorage`)
                const exeIndex = storage._exeActiveSinceForIndex.length - 1
                if (exeIndex < 0) {
                  return {
                    exeIndex: BigNumber.from(0),
                    activeSince: BigNumber.from(0),
                    executors: [],
                    threshold: BigNumber.from(0),
                  }
                }
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

              const payload = {
                function: `${contractAddr}::${findModuleName(prop)}::${prop}`,
                arguments: undefined,
                type_arguments: [],
              }

              const reqId = args[0]
              // const req = parseRequest(reqId)
              // const { supportedTokens, indexes, decimals } = await that._getSupportedTokens(contractAddr)
              // const i = indexes.findIndex(i => i === req.tokenIndex)
              // const tokenAddr = supportedTokens[i]
              // const tokenDecimals = decimals[i]
              if (prop === 'proposeMint') {
                payload.arguments = [
                  vectorize(reqId),
                  args[1],
                ]
              } else if (prop === 'executeMint') {
                payload.arguments = [
                  vectorize(reqId),
                  args[1].map(r => vectorize(r)),
                  args[2].map(yParityAndS => vectorize(yParityAndS)),
                  args[3].map(exe => vectorize(exe)),
                  BigNumber.from(args[4]).toHexString()
                ]
              } else if (prop === 'proposeBurn') {
                payload.arguments = [
                  vectorize(reqId),
                ]
              } else if (prop === 'executeBurn') {
                payload.arguments = [
                  vectorize(reqId),
                  args[1].map(r => vectorize(r)),
                  args[2].map(yParityAndS => vectorize(yParityAndS)),
                  args[3].map(exe => vectorize(exe)),
                  BigNumber.from(args[4]).toHexString()
                ]
              }

              const tx = await signer.signAndSubmitTransaction(payload, options)
              return {
                hash: utils.hexZeroPad(tx.hash, 32),
                wait: () => client.waitForTransaction({ transactionHash: tx.hash, options: { checkSuccess: true }})
              }
            }
          }
        }
      }
    })
  }

  _getResource = memoize(async (accountAddress, resourceType) => {
    try {
      return await this.#client.getAccountResource({ accountAddress, resourceType })
    } catch (e) {
      if (e.data?.error_code === 'resource_not_found') {
        return
      }
      throw e
    }
  }, (addr, type) => `${addr}|${type}`)

  _readTable = async (handle, data) => { // data: { key_type: string, value_type: string, key: any }
    try {
      return await this.#client.getTableItem({ handle, data })
    } catch (e) {
      if (e.data?.error_code === 'table_item_not_found') {
        return
      }
      throw e
    }
  }

  _getSupportedTokens = memoize(async (contractAddr) => {
    const storage = await this._getResource(contractAddr, `${contractAddr}::req_helpers::ReqHelpersStorage`)

    const indexes = []
    const decimals = []
    const supportedTokens = []

    for (const i of [34, 85, 86]) {
      const tableItem = await this._readTable(storage.tokens.handle, {
        key_type: 'u8',
        value_type: '0x1::object::Object<0x1::fungible_asset::Metadata>',
        key: i
      })
      if (!tableItem) {
        continue
      }
      const metadata = await this._getResource(tableItem.inner, `0x1::fungible_asset::Metadata`)
      indexes.push(i)
      decimals.push(metadata.decimals)
      supportedTokens.push(tableItem.inner)
    }

    return { supportedTokens, indexes, decimals }
  })
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

function vectorize(hex) {
  return Array.from(utils.arrayify(hex))
}

function formatAddress(addr) {
  return utils.hexZeroPad(addr, 32)
}
