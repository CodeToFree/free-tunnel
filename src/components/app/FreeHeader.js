import React from 'react'
import useSWR from 'swr'
import { Modal, Button } from 'flowbite-react'

import { fetcher } from '@/lib/api'

import { useFreeTunnel } from '@/components/AppProvider'
import { Header } from '@/components/ui'

import TunnelList from './TunnelList'

export default function FreeHeader () {
  const { tunnel } = useFreeTunnel()

  const [openModal, setOpenModal] = React.useState(false)
  const [selected, setSelected] = React.useState(tunnel)

  const { data = [], error } = useSWR('api/v1/tunnels', fetcher)

  return (
    <Header>
      <div className='flex items-center'>
        <a href={tunnel.homepage} target='_blank'><img src={tunnel.logo} className='mr-2 h-6' alt='' /></a>
        <div className='text-black text-lg font-medium'>{tunnel.name}</div>
        <Button size='xs' color='gray' className='ml-2' onClick={() => setOpenModal(true)}>Switch</Button>
      </div>
      <Modal dismissible size='6xl' show={openModal} onClose={() => setOpenModal(false)}>
        <Modal.Header>Switch Tunnel</Modal.Header>
        <Modal.Body>
          <TunnelList tunnels={data} current={tunnel.id} action='Switch' className='w-full' />
        </Modal.Body>
      </Modal>
    </Header>
  )
}
