import React from 'react'
import { Dropdown, Button, Spinner } from 'flowbite-react'

import { useWeb3Modal, useWeb3ModalState } from '@web3modal/ethers5/react'

import { TRONLINK } from '@/lib/const'
import { useChain, useAddress } from '@/lib/hooks'
import { TokenIcon } from '@/components/ui'
import { useAppHooks } from '@/components/AppProvider'

export default function ConnectedAddress() {
  const [ready, setReady] = React.useState(false)
  React.useEffect(() => setReady(true), [])

  const { open } = useWeb3Modal()
  const { open: isOpen } = useWeb3ModalState()
  const chain = useChain()
  const address = useAddress()
  const { tronlink } = useAppHooks()

  let btn
  if (!ready) {
    return <Button pill size='md' color='light'>Unknown</Button>
  } else if (tronlink.account) {
    btn = <Button pill color='light'><TokenIcon token='tron' />Tron</Button>
  } else if (!address) {
    let label = isOpen ? <><Spinner size='sm' className='mr-2' />Connecting...</> : 'Disconnected'
    if (TRONLINK) {
      btn = (
        <Dropdown
          pill
          color='light'
          label={label}
          arrowIcon={false}
        >
          <Dropdown.Item onClick={() => open()}>Ethereum / Arbitrum</Dropdown.Item>
          <Dropdown.Item onClick={() => tronlink.connect()}>Tron Wallet</Dropdown.Item>
        </Dropdown>
      )
    } else {
      btn = <Button pill size='md' color='light' onClick={() => open()}>{label}</Button>
    }
  } else if (chain) {
    btn = <w3m-network-button />
  } else {
    btn = <Button pill size='md' color='light' onClick={() => open({ view: 'Networks' })}>Unknown</Button>
  }

  return (
    <div className='flex flex-row items-center gap-2'>
      {btn}
      <div className='flex-1 overflow-hidden text-ellipsis text-sm font-medium dark:text-white'>
        {ready && address}
      </div>
    </div>
  )
}
