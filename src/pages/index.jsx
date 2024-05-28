import React from 'react'
import Head from 'next/head'

import { Channels } from '@/lib/db'
import { ListGroup } from 'flowbite-react'

import { AppProvider } from '@/components/AppProvider'
import { AppContainer } from '@/components/ui'
import { useWeb3ModalFromChannel } from '@/lib/hooks'

export default function Home({ channels }) {
  const ready = useWeb3ModalFromChannel()
  if (!ready) {
    return
  }

  return (
    <AppProvider>
      <Head>
        <title>Free Tunnel</title>
        <link rel='icon' href='/free.png' />
      </Head>
      <AppContainer>
        <div className='mt-20 flex justify-center'>
          <ListGroup className='w-80'>
          {
            channels.map(item => (
              <ListGroup.Item key={item.id} onClick={() => window.location.href = `/${item.id}`}>
                <div className='flex items-center py-2'>
                  <img src={item.logo} className='w-6 h-6 mr-3' />
                  {item.name}
                </div>
              </ListGroup.Item>
            ))
          }
          </ListGroup>
        </div>
      </AppContainer>
    </AppProvider>
  )
}

export const getServerSideProps = async (req) => {
  const result = await Channels.find().sort({ priority: -1 }).select('_id name logo')
  const channels = result.map(({ _id, name, logo }) => ({ id: _id, name, logo }))
  return { props: { channels } }
}
