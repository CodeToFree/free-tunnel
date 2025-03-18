export function openInExplorer(hash, chain) {
  switch (chain.chainId) {
    case 'aptos:1':
      return window.open(`${chain.explorerUrl}/txn/${hash}?network=mainnet`, '_blank')
    case 'aptos:2':
      return window.open(`${chain.explorerUrl}/txn/${hash}?network=testnet`, '_blank')
    case 'aptos:250':
      return window.open(`${chain.explorerUrl}/txn/${hash}?network=mainnet`, '_blank')
    case 'tron':
      return window.open(`${chain.explorerUrl}/#/transaction/${hash}`, '_blank')
    default:
      window.open(`${chain.explorerUrl}/tx/${hash}`, '_blank')
  }
}

export function addressLinkInExplorer(address, chain, isContract) {
  switch (chain.chainId) {
    case 'aptos:1':
      return `${chain.explorerUrl}/account/${address}${isContract ? '/modules' : ''}?network=mainnet`
    case 'aptos:2':
      return `${chain.explorerUrl}/account/${address}${isContract ? '/modules' : ''}?network=testnet`
    case 'aptos:250':
      return `${chain.explorerUrl}/account/${address}${isContract ? '/modules' : ''}?network=mainnet`
    case 'rooch':
    case 'rooch_testnet':
      if (isContract) {
        return `${chain.explorerUrl}/object/${address}`
      }
      return `${chain.explorerUrl}/account/${address}`
    default:
      return `${chain.explorerUrl}/address/${address}`
  }
}

export async function wait(tx, timeout = 90) {
  if (tx.wait) {
    return await tx.wait(1)
  }

  if (window.tronLink) {
    return new Promise((resolve, reject) => {
      const tryGetTransaction = async () => {
        let info
        try {
          info = await tronLink.tronWeb.trx.getTransactionInfo(tx.hash)
        } catch {}
        if (Object.keys(info).length) {
          clearInterval(h)
          resolve(info)
        }
      }
      const h = setInterval(tryGetTransaction, 2000)
      tryGetTransaction()

      if (timeout) {
        setTimeout(() => {
          clearInterval(h)
          reject(new Error('Time out'))
        }, timeout * 1000)
      }
    })
  }
}
