import React from 'react'
import { utils } from 'ethers'
import { getWallets as getSuiWallets } from '@wallet-standard/core'
import { AptosWalletAdapter } from '@mesonfi/aptos-wallet-adapter/dist/WalletAdapters/PetraWallet'

import {
  Signer as _RoochSigner,
  Authenticator,
  BitcoinSignMessage,
  BitcoinAddress,
  RoochAddress,
  str,
  bytes,
  Secp256k1PublicKey,
  fromHEX,
} from '@roochnetwork/rooch-sdk'

const CHAIN_ID_BY_NAME = {
  mainnet: 1,
  'movement mainnet': 250
}

export default function useNonEthersWallets(addToast) {
  const [account, setAccount] = React.useState(null)

  // const tronlinkListener = React.useCallback(e => {
  //   const { isTronLink, message } = e.data
  //   if (!isTronLink || !message) {
  //     return
  //   }

  //   switch (message.action) {
  //     case 'tabReply':
  //     case 'connect':
  //     case 'disconnect':
  //       break
  //     case 'accountsChanged': {
  //       const address = message.data.address
  //       setTronAccount(window.tronLink.tronWeb.defaultAddress)
  //       break
  //     }
  //   }
  // }, [])

  // const h = React.useRef()

  const disconnect = React.useCallback(() => {
    setAccount(account => {
      if (account.chainId === 'sui') {
        account.signer.features['standard:disconnect']?.disconnect()
      } else if (account.chainId.startsWith('aptos')) {
        account.signer.removeAllListeners()
      } else if (account.chainId.startsWith('rooch')) {
      }
      return null
    })
  }, [])

  const connect = React.useCallback(async (nonEvmChain) => {
    if (nonEvmChain === 'sui') {
      const suiWallets = getSuiWallets().get().filter(w => (
        'standard:connect' in w.features &&
        'standard:events' in w.features &&
        'sui:signAndExecuteTransactionBlock' in w.features &&
        ['Martian Sui Wallet'].includes(w.name)
      ))

      if (!suiWallets.length) {
        addToast({ type: 'error', content: 'No Sui wallet installed.' })
        return
      }

      const ext = suiWallets[0]
      await ext.features['standard:connect'].connect()
      const account = ext.accounts[0]
      const address = '0x' + account.address?.replace('0x', '').padStart(64, '0')
      setAccount({ address, chainId: nonEvmChain, signer: ext })
    } if (nonEvmChain === 'aptos') {
      const aptosWallet = new AptosWalletAdapter()

      aptosWallet.on('connect', () => {
        const address = utils.hexZeroPad(aptosWallet.publicAccount.address, 32)
        console.log(aptosWallet.network)
        const chainId = aptosWallet.network.chainId || CHAIN_ID_BY_NAME[aptosWallet.network.name.toLowerCase()]
        setAccount({ address, chainId: `aptos:${Number(chainId)}`, signer: aptosWallet })
      })

      await aptosWallet.connect()
    } else if (nonEvmChain === 'rooch' || nonEvmChain === 'rooch_testnet') {
      const roochWallets = []
      if (window.okxwallet?.bitcoin) {
        roochWallets.push({
          name: 'OKX Wallet (Bitcoin)',
          id: 'okxwallet-bitcoin',
          provider: window.okxwallet.bitcoin,
        })
      }
      if (window.unisat) {
        roochWallets.push({
          name: 'Unisat',
          id: 'unisat',
          provider: window.unisat,
        })
      }

      if (!roochWallets.length) {
        addToast({ type: 'error', content: 'No Rooch wallet installed.' })
        return
      }

      const ext = roochWallets[0]
      const account = await ext.provider.connect?.()
      const btcAddress = new BitcoinAddress(account.address)
      const publicKey = account.compressedPublicKey
      const roochAddress = btcAddress.genRoochAddress()
      const address = roochAddress.toBech32Address()
      setAccount({ address, chainId: nonEvmChain, signer: new RoochSigner(ext, btcAddress, publicKey) })
    }

    return

    // if (!window.tronLink) {
    //   window.open('https://chromewebstore.google.com/detail/tronlink/ibnejdfjmmkpcnlpebklmnkoeoihofec', '_blank')
    //   return
    // }
    // await window.tronLink.request({ method: 'tron_requestAccounts' })
    // const tronWeb = window.tronLink.tronWeb
    // if (!tronWeb.ready) {
    //   addToast({ type: 'error', content: 'Connect TronLink failed. Unlock TronLink and try again.' })
    //   return
    // }

    // window.addEventListener('message', tronlinkListener)
    // setTronAccount(tronWeb.defaultAddress)

    // h.current = setInterval(() => {
    //   const connected = !!window.tronLink.tronWeb
    //   if (!connected) {
    //     disconnect()
    //   }
    // }, 1000)
  }, [addToast])

  return React.useMemo(() => ({
    account,
    connect,
    disconnect,
  }), [account, connect, disconnect])
}



class RoochSigner extends _RoochSigner {
  #ext

  constructor(ext, btcAddress, publicKey) {
    super()
    this.#ext = ext
    this.currentAddress = btcAddress
    this.publicKey = publicKey
  }

  async signTransaction(input) {
    const message = new BitcoinSignMessage(input.hashData(), input.getInfo() || '')
    return Authenticator.bitcoin(message, this, 'raw')
  }

  async sign(msg) {
    const msgStr = str('utf8', msg)
    const sign = await this.#ext.provider.signMessage(msgStr, {
      from: this.currentAddress?.toStr(),
    })
    return bytes('base64', sign).subarray(1)
  }

  getBitcoinAddress() {
    if (!this.currentAddress) {
      throw Error('Please connect your wallet first')
    }
    return this.currentAddress
  }

  getRoochAddress() {
    if (!this.currentAddress) {
      throw Error('Please connect your wallet first')
    }
    return (this.currentAddress).genRoochAddress()
  }

  getKeyScheme() {
    return 'Secp256k1'
  }

  getPublicKey() {
    if (!this.publicKey) {
      throw Error('Please connect your wallet first')
    }
    return new Secp256k1PublicKey(fromHEX(this.publicKey))
  }
}
