import React from 'react'
import { Navbar } from 'flowbite-react'

import { ConnectButton } from '@/components/web3'

export default function Header () {
  return (
    <Navbar fluid className='shadow-md px-4 sm:px-8 lg:px-12 dark:bg-white'>
      <Navbar.Brand href={process.env.NEXT_PUBLIC_APP_URL} target='_blank'>
        <img src='/logo.png' className='mr-3 h-7' alt='atomic-lock-mint' />
      </Navbar.Brand>
      <ConnectButton pill />
    </Navbar>
  )
}
