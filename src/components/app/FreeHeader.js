import React from 'react'
import useSWR from 'swr'
import { Button, Modal, Dropdown } from 'flowbite-react'
import { HiCheckCircle } from 'react-icons/hi'

import { fetcher } from '@/lib/api'

import { useFreeChannel } from '@/components/AppProvider'
import { Header } from '@/components/ui'

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
        <Modal.Header>Switch Atomic-Lock-Mint Channel</Modal.Header>
        <Modal.Body>
          <Dropdown color='gray' size='lg' label={<><img src={selected.logo} className='w-5 h-5 mr-2' />{selected.name}</>} dismissOnClick={false}>
          {
            data.map(item => (
              <Dropdown.Item key={item.id} onClick={() => setSelected(item)}>
                <img src={item.logo} className='w-5 h-5 mr-2' />
                {item.name}
                {item.id === selected.id && <HiCheckCircle size={18} className='ml-1' />}
              </Dropdown.Item>
            ))
          }
          </Dropdown>
        </Modal.Body>
        <Modal.Footer className='flex justify-end'>
          <Button onClick={() => window.location.href = `/${selected.id}`}>Confirm</Button>
        </Modal.Footer>
      </Modal>
    </Header>
  )
}