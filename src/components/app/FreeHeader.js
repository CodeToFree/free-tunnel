import React from 'react'
import useSWR from 'swr'
import { Modal, Button } from 'flowbite-react'

import { fetcher } from '@/lib/api'

import { useFreeChannel } from '@/components/AppProvider'
import { Header } from '@/components/ui'

import ChannelList from './ChannelList'

export default function FreeHeader () {
  const { channel } = useFreeChannel()

  const [openModal, setOpenModal] = React.useState(false)
  const [selected, setSelected] = React.useState(channel)

  const { data = [], error } = useSWR('api/v1/channel', fetcher)

  return (
    <Header>
      <div className='flex items-center'>
        <a href={channel.homepage} target='_blank'><img src={channel.logo} className='mr-2 h-6' alt='' /></a>
        <div className='text-black text-lg font-medium'>{channel.name}</div>
        <Button size='xs' color='gray' className='ml-2' onClick={() => setOpenModal(true)}>Switch</Button>
      </div>
      <Modal dismissible show={openModal} onClose={() => setOpenModal(false)}>
        <Modal.Header>Switch Channel</Modal.Header>
        <Modal.Body>
          <ChannelList channels={data} action='Switch' />
        </Modal.Body>
      </Modal>
    </Header>
  )
}
