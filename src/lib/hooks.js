import React from 'react'
import { ethers } from 'ethers'
import { useWeb3ModalProvider, useWeb3ModalAccount } from '@web3modal/ethers5/react'

import { CHAINS } from '@/lib/const'
import ERC20 from '@/lib/abis/ERC20.json'
import { openInExplorer, wait } from '@/lib/tx'
import { useAppHooks } from '@/components/AppProvider'

export function useChain() {
  const [ready, setReady] = React.useState(false)
  React.useEffect(() => setReady(true), [])

  const { isConnected, chainId } = useWeb3ModalAccount()
  const { tronlink } = useAppHooks()

  return React.useMemo(
    () => CHAINS.find(c => c.chainId === (tronlink.account ? 'tron' : (ready && isConnected && chainId))),
    [ready, isConnected, chainId, tronlink.account]
  )
}

export function useAddress() {
  const { isConnected, address } = useWeb3ModalAccount()
  const { tronlink } = useAppHooks()

  if (tronlink.account) {
    return tronlink.account.base58
  } else if (isConnected) {
    return address
  }
}

export function useProvider() {
  const { walletProvider } = useWeb3ModalProvider()
  const { tronlink } = useAppHooks()

  return React.useMemo(() => {
    if (tronlink.account) {
      return window.tronLink.tronWeb
    } else if (!walletProvider) {
      return
    }
    return new ethers.providers.Web3Provider(walletProvider, 'any')
  }, [walletProvider, tronlink])
}

export function useContract(address, abi) {
  const provider = useProvider()
  const { tronlink } = useAppHooks()

  return React.useMemo(() => {
    if (!provider || !address || !abi) {
      return
    } else if (tronlink.account) {
      return provider.contract(abi, address)
    }
    return new ethers.Contract(address, abi, provider.getSigner())
  }, [tronlink, provider, address, abi])
}

export function useERC20(tokenAddress) {
  return useContract(tokenAddress, ERC20)
}

export function useCoreBalance() {
  const chain = useChain()
  const address = useAddress()
  const provider = useProvider()

  const symbol = chain?.currency
  const decimals = chain?.chainId === 'tron' ? 6 : 18
  const [balance, setBalance] = React.useState()
  
  const refresh = React.useCallback(() => {
    setBalance()

    if (!chain || !address || !provider) {
      return
    }

    if (chain.chainId === 'tron') {
      provider.trx.getBalance(address).then(balance => setBalance(ethers.BigNumber.from(balance)))
    } else {
      provider.getBalance(address).then(setBalance)
    }
  }, [chain, address, provider])

  React.useEffect(() => refresh(), [refresh])

  return { symbol, decimals, balance, refresh }
}

export function useERC20Balance(tokenAddress) {
  const chain = useChain()
  const address = useAddress()
  const tokenContract = useERC20(tokenAddress)

  const [decimals, setDecimals] = React.useState()
  const [balance, setBalance] = React.useState()

  const refresh = React.useCallback(() => {
    setDecimals()
    setBalance()

    if (!chain || !address || !tokenContract) {
      return
    }

    if (chain.chainId === 'tron') {
      Promise.all([
        tokenContract.decimals().call({ from: address }),
        tokenContract.balanceOf(address).call({ from: address }),
      ]).then(([decimals, balance]) => {
        setDecimals(decimals)
        setBalance(balance)
      })
      tokenContract.balanceOf(address).call({ from: address }).then(setBalance)
    } else {
      Promise.all([tokenContract.decimals(), tokenContract.balanceOf(address)])
        .then(([decimals, balance]) => {
          setDecimals(decimals)
          setBalance(balance)
        })
    }
  }, [chain, address, tokenContract])

  React.useEffect(() => refresh(), [refresh])

  return { decimals, balance, refresh }
}

export function useERC20Allowance(tokenAddress, spender) {
  const chain = useChain()
  const address = useAddress()
  const tokenContract = useERC20(tokenAddress)

  const [approved, setApproved] = React.useState()

  const refresh = React.useCallback(() => {
    setApproved()

    if (!chain || !address || !tokenContract || !spender) {
      return
    }

    if (chain.chainId === 'tron') {
      tokenContract.allowance(address, spender).call({ from: address }).then(setApproved)
    } else {
      tokenContract.allowance(address, spender).then(setApproved)
    }
  }, [chain, address, tokenContract, spender])

  React.useEffect(() => refresh(), [refresh])

  return { approved, refresh }
}

export function useContractCall(address, abi, method, args = []) {
  const chain = useChain()
  const contractInstance = useContract(address, abi)
  const { addToast, removeToast } = useAppHooks()

  const [pending, setPending] = React.useState(false)

  const call = React.useCallback(async () => {
    if (!chain || !contractInstance) {
      return
    }

    setPending(true)
    let tx
    try {
      if (chain.chainId === 'tron') {
        tx = { hash: await contractInstance[method](...args).send() }
      } else {
        tx = await contractInstance[method](...args)
      }
    } catch (e) {
      setPending(false)
      addToast({ type: 'error', content: e.message })
      return
    }

    const toastId = addToast({
      type: 'loading',
      content: 'Waiting transaction...',
      buttons: [{
        text: 'View on Explorer',
        onClick: () => openInExplorer(tx, chain)
      }]
    })
    try {
      await wait(tx)
    } catch (e) {
      setPending(false)
      removeToast(toastId)
      addToast({ type: 'error', content: e.message })
      return
    }
    removeToast(toastId)
    addToast({
      content: 'Transaction executed!',
      buttons: [{
        text: 'View on Explorer',
        onClick: () => openInExplorer(tx, chain)
      }]
    })
    setPending(false)
    return true
  }, [chain, contractInstance, method, args, addToast, removeToast])

  return { pending, call }
}

export function useERC20Call(address, method, args) {
  return useContractCall(address, ERC20, method, args)
}
