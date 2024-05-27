import React from 'react'
import Head from 'next/head'

import useSWR from 'swr'
import { ListGroup } from 'flowbite-react'

import { AppContainer } from '@/components/ui'
import { fetcher } from '@/lib/api'

export default function Home() {
  const { data = [], error } = useSWR('api/v1/channel', fetcher)

  return (
    <AppContainer noHeader>
      <Head>
        <title>Free Atomic-Lock-Mint</title>
      </Head>

      <div className='mt-20 flex justify-center'>
        <ListGroup className='w-80'>
        {
          data.map(item => (
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
  )
}
