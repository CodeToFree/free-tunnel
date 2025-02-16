import React from 'react'
import { Dropdown, Button, Spinner } from 'flowbite-react'
import { useWeb3Modal, useWeb3ModalState } from '@web3modal/ethers5/react'
import { useSafeAppsSDK } from '@safe-global/safe-apps-react-sdk'

import { NON_ETHERS_WALLETS } from '@/lib/const'
import { useChain, useAddress } from '@/lib/hooks'

import { useAppHooks } from '../AppProvider'

export default function ConnectButton ({ pill, size, color, forceChains, disabled, onClick, children }) {
  const [ready, setReady] = React.useState(false)
  React.useEffect(() => setReady(true), [])

  const { wallets } = useAppHooks()
  const { open } = useWeb3Modal()
  const { open: isOpen } = useWeb3ModalState()
  const { connected } = useSafeAppsSDK()
  const chain = useChain()
  const address = useAddress()

  if (!ready) {
    return <Button pill={pill} size={size} color={color} disabled><Spinner size='sm' /></Button>
  } else if (!address) {
    if (isOpen) {
      return <Button pill={pill} size={size} color={color}><Spinner size='sm' className='mr-2' />Connecting...</Button>
    } else if (NON_ETHERS_WALLETS) {
      return (
        <Dropdown pill={pill} size={size} color={color} arrowIcon={false} label='Connect Wallet'>
          <Dropdown.Item onClick={() => open()}>EVM Wallets</Dropdown.Item>
          <Dropdown.Item onClick={() => wallets.connect('sui')}>Sui Wallet</Dropdown.Item>
          <Dropdown.Item onClick={() => wallets.connect('rooch')}>Rooch Wallet</Dropdown.Item>
        </Dropdown>
      )
    } else {
      return <Button pill={pill} size={size} color={color} onClick={() => open({ view: 'Connect' })}>Connect Wallet</Button>
    }
  } else if (forceChains && !forceChains.find(c => c.chainId === chain?.chainId)) {
    if (typeof chain.chainId === 'string') {
      return (
        <Button pill={pill} size={size} color={color} onClick={() => wallets.disconnect()}>
          Disconnect Unsupported Wallet
        </Button>
      )
    }
    return (
      <Button pill={pill} size={size} color={color} onClick={() => !connected && open({ view: 'Networks' })}>
        Switch to {forceChains.map(c => c.name).join('/')} {connected && ' in Safe Wallet'}
      </Button>
    )
  } else if (!chain) {
    return <Button pill={pill} size={size} color={color} onClick={() => open({ view: 'Networks' })}>Switch Network</Button>
  } else if (children) {
    if (onClick) {
      return <Button pill={pill} size={size} color={color} disabled={disabled} onClick={onClick}>{children}</Button>
    }
    return React.cloneElement(children, {
      Wrapper: ({ onClick, disabled, children }) => <Button pill={pill} size={size} color={color} disabled={disabled} onClick={onClick}>{children}</Button>
    })
  } else if (typeof chain.chainId === 'string') {
    return (
      <Dropdown
        pill={pill} size={size} color={color} arrowIcon={false}
        label={abbreviateAddress(address)}
      >
        <Dropdown.Item onClick={() => wallets.disconnect()}>Disconnect</Dropdown.Item>
      </Dropdown>
    )
  } else if (connected) {
    return (
      <Button pill={pill} size={size} color={color}>
        {abbreviateAddress(address)}
      </Button>
    )
  } else {
    return (
      <Button pill={pill} size={size} color={color} onClick={() => open({ view: 'Account' })}>
        {abbreviateAddress(address)}
      </Button>
    )
  }
}


function abbreviateAddress (addr = '') {
  if (addr.startsWith('0x')) {
    return `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}`
  } else if (addr.startsWith('rooch')) {
    return `${addr.substring(0, 9)}...${addr.substring(addr.length - 4)}`
  } else {
    return `${addr.substring(0, 4)}...${addr.substring(addr.length - 4)}`
  }
}