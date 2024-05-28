import React from 'react'
import { Navbar, Button } from 'flowbite-react'

import { ConnectButton } from '@/components/web3'

export default function Header (props) {
  return (
    <Navbar fluid className='shadow-md px-4 sm:px-8 lg:px-12 dark:bg-white'>
      <Navbar.Brand href='/'>
        <img src='/free.png' className='mr-3 h-7' alt='' />
        <div className='text-black text-xl font-semibold'>Free Tunnel</div>
      </Navbar.Brand>
      {props.children}
      <ConnectButton pill />
    </Navbar>
  )
}
