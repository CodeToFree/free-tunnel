import React from 'react'
import Head from 'next/head'

import { Channels } from '@/lib/db'

import { AppProvider } from '@/components/AppProvider'
import { AppContainer } from '@/components/ui'
import { ChannelList } from '@/components/app'
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
          <ChannelList channels={channels} className='w-[640px] text-white' />
        </div>
      </AppContainer>
    </AppProvider>
  )
}

export const getServerSideProps = async (req) => {
  const result = await Channels.find().sort({ priority: -1 }).select('_id name logo from to contracts')
  const channels = result.map(({ _id, name, logo, from, to, contracts }) => ({ id: _id, name, logo, from, to, contracts }))
  return { props: { channels } }
}
