import React from 'react'
import { Dropdown, Button, Spinner } from 'flowbite-react'
import { useWeb3Modal, useWeb3ModalState } from '@web3modal/ethers5/react'

import { TRONLINK } from '@/lib/const'
import { useChain, useAddress } from '@/lib/hooks'

import { useAppHooks } from '../AppProvider'

export default function ConnectButton ({ pill, size, color, onClick, children }) {
  const [ready, setReady] = React.useState(false)
  React.useEffect(() => setReady(true), [])

  const { open } = useWeb3Modal()
  const { open: isOpen } = useWeb3ModalState()
  const chain = useChain()
  const address = useAddress()

  const { tronlink } = useAppHooks()

  if (!ready) {
    return <Button pill={pill} size={size} color={color} disabled><Spinner size='sm' /></Button>
  } else if (!address) {
    if (isOpen) {
      return <Button pill={pill} size={size} color={color}><Spinner size='sm' className='mr-2' />Connecting...</Button>
    } else if (TRONLINK) {
      return (
        <Dropdown pill={pill} size={size} color={color} arrowIcon={false} label='Connect Wallet'>
          <Dropdown.Item onClick={() => open()}>Ethereum / Arbitrum</Dropdown.Item>
          <Dropdown.Item onClick={() => tronlink.connect()}>Tron Wallet</Dropdown.Item>
        </Dropdown>
      )
    } else {
      return <Button pill={pill} size={size} color={color} onClick={() => open({ view: 'Connect' })}>Connect Wallet</Button>
    }
  } else if (!chain) {
    return <Button pill={pill} size={size} color={color} onClick={() => open({ view: 'Networks' })}>Switch Network</Button>
  } else if (children) {
    if (onClick) {
      return <Button pill={pill} size={size} color={color} onClick={onClick}>{children}</Button>
    }
    return React.cloneElement(children, {
      Wrapper: ({ onClick, disabled, children }) => <Button pill={pill} size={size} color={color} disabled={disabled} onClick={onClick}>{children}</Button>
    })
  } else if (chain.chainId === 'tron') {
    return (
      <Dropdown
        pill={pill} size={size} color={color} arrowIcon={false}
        label={`${address.substring(0, 6)}...${address.substring(address.length - 6)}`}
      >
        <Dropdown.Item onClick={() => tronlink.disconnect()}>Disconnect</Dropdown.Item>
      </Dropdown>
    )
  } else {
    return (
      <Button pill={pill} size={size} color={color} onClick={() => open({ view: 'Account' })}>
        {address.substring(0, 6)}...{address.substring(address.length - 4)}
      </Button>
    )
  }
}
