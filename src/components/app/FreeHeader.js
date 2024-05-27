import React from 'react'
import useSWR from 'swr'
import { Button, Modal, Dropdown } from 'flowbite-react'
import { HiCheckCircle } from 'react-icons/hi'

import { CHAINS } from '@/lib/const'
import { fetcher } from '@/lib/api'

import { useFreeChannel } from '@/components/AppProvider'
import { Header, TokenIcon } from '@/components/ui'

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
          <ChannelDetail channel={selected} /> 
        </Modal.Body>
        <Modal.Footer className='flex justify-end'>
          <Button onClick={() => window.location.href = `/${selected.id}`}>Confirm</Button>
        </Modal.Footer>
      </Modal>
    </Header>
  )
}

export function ChannelDetail ({ channel }) {
  return (
    <div className='mt-5 grid gap-y-4'>
    {
      channel.from.map(id => {
        const chain = typeof id === 'string' ? CHAINS.find(c => c.id === id) : id
        return <ChainDetail key={chain.id} chain={chain} contractAddr={channel.contracts[chain.id]} />
      })
    }
    {
      channel.to.map(id => {
        const chain = typeof id === 'string' ? CHAINS.find(c => c.id === id) : id
        return <ChainDetail key={chain.id} chain={chain} contractAddr={channel.contracts[chain.id]} />
      })
    }
    </div>
  )
}

export function ChainDetail ({ chain, contractAddr }) {
  return (
    <div>
      <div className='flex items-center text-lg'><TokenIcon size='sm' token={chain.icon} />{chain.name}</div>
      <div className='ml-6'>
        Contract: <a className='text-sm hover:underline hover:text-cyan-600' href={`${chain.explorerUrl}/address/${contractAddr}`} target='_blank'>{contractAddr}</a>
      </div>
    </div>
  )
}