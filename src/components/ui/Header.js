import React from 'react'
import { Navbar } from 'flowbite-react'

import { PROJECT_ICON, PROJECT_HOMEPAGE, BRIDGE_CHANNEL } from '@/lib/const'
import { ConnectButton } from '@/components/web3'

export default function Header () {
  return (
    <Navbar fluid className='shadow-md px-4 sm:px-8 lg:px-12 dark:bg-white'>
      <Navbar.Brand href={PROJECT_HOMEPAGE} target='_blank'>
        <img src={PROJECT_ICON} className='mr-3 h-7' alt='' />
        <div className='text-black text-lg font-bold'>{BRIDGE_CHANNEL}</div>
      </Navbar.Brand>
      <ConnectButton pill />
    </Navbar>
  )
}
