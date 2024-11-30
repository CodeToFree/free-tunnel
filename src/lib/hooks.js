import React from 'react'
import { ethers } from 'ethers'
import { createWeb3Modal, defaultConfig, useWeb3ModalProvider, useWeb3ModalAccount } from '@web3modal/ethers5/react'

import { useSafeAppsSDK } from '@safe-global/safe-apps-react-sdk'
import { SafeAppProvider } from '@safe-global/safe-apps-provider'

import { DARK_MODE, CHAINS } from '@/lib/const'
import ERC20 from '@/lib/abis/ERC20.json'
import { openInExplorer, wait } from '@/lib/tx'
import { useAppHooks } from '@/components/AppProvider'

export function useWeb3ModalFromChannel(channel) {
  const channelId = channel?.id
  const [ready, setReady] = React.useState(false)

  const chains = React.useMemo(() => {
    if (!channelId) {
      return CHAINS
    }
    return [...channel.from, ...channel.to].map(id => CHAINS.find(c => c.id === id))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [channelId])

  React.useEffect(() => {
    const projectId = process.env.NEXT_PUBLIC_WC_PROJECT_ID || '';

    const metadata = {
      name: 'Free Tunnel',
      description: '',
      url: '',
      icons: ['/logo.png'],
    }

    createWeb3Modal({
      projectId,
      themeMode: DARK_MODE ? 'dark' : 'light',
      chains: chains.filter(c => typeof c.chainId === 'number'),
      chainImages: Object.fromEntries(chains.map(c => [c.chainId, `/tokens/${c.icon}.png`])),
      ethersConfig: defaultConfig({ metadata }),
      excludeWalletIds: [
        'a797aa35c0fadbfc1a53e7f675162ed5226968b44a19ee3d24385c64d1d3c393'
      ],
      themeVariables: {
        '--w3m-accent': '#6335FF',
      }
    })

    setReady(true)
  }, [chains])

  return ready
}

export function toValue(input, decimals = 18) {
  if (ethers.BigNumber.isBigNumber(input)) {
    return input
  }
  try {
    return ethers.utils.parseUnits(Number(input) ? input : '0', decimals)
  } catch {
    return ethers.BigNumber.from(-1)
  }
}

export function useChain() {
  const [ready, setReady] = React.useState(false)
  React.useEffect(() => setReady(true), [])

  const { isConnected, chainId } = useWeb3ModalAccount()
  const { connected, safe } = useSafeAppsSDK()
  const { tronlink } = useAppHooks()

  const match = tronlink.account
    ? 'tron'
    : connected ? safe.chainId : (ready && isConnected && chainId)
  return React.useMemo(() => CHAINS.find(c => c.chainId === match), [match])
}

export function useAddress(_address) {
  const { isConnected, address } = useWeb3ModalAccount()
  const { connected, safe } = useSafeAppsSDK()
  const { tronlink } = useAppHooks()

  if (_address) {
    return _address
  } else if (tronlink.account) {
    return tronlink.account.base58
  } else if (connected) {
    return safe.safeAddress
  } else if (isConnected) {
    return address
  }
}

export function useProvider(chain) {
  const _chain = useChain()
  const { walletProvider } = useWeb3ModalProvider()
  const { connected, sdk, safe } = useSafeAppsSDK()
  const { tronlink } = useAppHooks()

  const validWalletProvider = _chain && walletProvider
  return React.useMemo(() => {
    if (tronlink.account) {
      return window.tronLink.tronWeb
    } else if (chain) {
      return new ethers.providers.StaticJsonRpcProvider(chain.rpcUrl)
    } else if (connected) {
      return new ethers.providers.Web3Provider(new SafeAppProvider(safe, sdk))
    } else if (!validWalletProvider) {
      return
    } else {
      return new ethers.providers.Web3Provider(validWalletProvider, 'any')
    }
  }, [chain, tronlink, connected, sdk, safe, validWalletProvider])
}

export function useContract(address, abi, chain) {
  const provider = useProvider(chain)
  const { tronlink } = useAppHooks()

  return React.useMemo(() => {
    if (!provider || !address || !abi) {
      return
    } else if (tronlink.account) {
      return provider.contract(abi, address)
    } else if (!ethers.utils.isAddress(address)) {
      return
    } else if (chain) {
      return new ethers.Contract(address, abi, provider)
    } else {
      return new ethers.Contract(address, abi, provider.getSigner())
    }
  }, [tronlink, provider, chain, address, abi])
}

export function useERC20(tokenAddress) {
  return useContract(tokenAddress, ERC20)
}

export function useCoreBalance(_address) {
  const chain = useChain()
  const address = useAddress(_address)
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

export function useERC20Balance(tokenAddress, _address) {
  const chain = useChain()
  const address = useAddress(_address)
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

export function useContractQuery(address, abi, method, args, chain, refreshTrigger = true) {
  const contractInstance = useContract(address, abi, chain)

  const [pending, setPending] = React.useState(false)
  const [result, setResult] = React.useState()

  const refresh = React.useCallback(() => {
    setPending(false)
    setResult()
    if (!contractInstance) {
      return
    }

    setPending(true)
    contractInstance[method](...(args || [])).then(result => {
      setPending(false)
      setResult(result)
    })
  }, [contractInstance, method, args])

  React.useEffect(() => {
    if (refreshTrigger) {
      refresh()
    }
  }, [refresh, refreshTrigger])

  return { pending, result }
}

export function useERC20Query(address, method, args, chain) {
  return useContractQuery(address, ERC20, method, args, chain)
}

export function useContractCall(address, abi, method, args) {
  const chain = useChain()
  const contractInstance = useContract(address, abi)
  const { addToast, removeToast } = useAppHooks()

  const [pending, setPending] = React.useState(false)

  const call = React.useCallback(async (_args) => {
    if (!chain || !contractInstance) {
      return
    }

    setPending(true)
    let tx
    try {
      if (chain.chainId === 'tron') {
        tx = { hash: await contractInstance[method](...(_args || args || [])).send() }
      } else {
        tx = await contractInstance[method](...(_args || args || []))
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
    return tx.hash
  }, [chain, contractInstance, method, args, addToast, removeToast])

  return { pending, call }
}

export function useERC20Call(address, method, args) {
  return useContractCall(address, ERC20, method, args)
}
