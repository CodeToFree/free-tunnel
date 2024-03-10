export function openInExplorer(tx, chain) {
  if (chain.chainId === 'tron') {
    window.open(`${chain.explorerUrl}/#/transaction/${tx.hash}`, '_blank')
  } else {
    window.open(`${chain.explorerUrl}/tx/${tx.hash}`, '_blank')
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
