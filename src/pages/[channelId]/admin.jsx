import React from 'react'
import Head from 'next/head'

import { useWeb3ModalFromChannel } from '@/lib/hooks'

import { AppProvider } from '@/components/AppProvider'
import { TabAdmin } from '@/components/app'

export default function PageChannelAdmin({ channel }) {
  const ready = useWeb3ModalFromChannel(channel)
  if (!ready) {
    return
  }

  return (
    <AppProvider channel={channel}>
      <Head>
        <title>{channel.name}</title>
        <link rel='icon' href={channel.logo} />
      </Head>
      <TabAdmin />
    </AppProvider>
  )
}

export const getServerSideProps = async (req) => {
  const { Channels, Fees } = await import('@/lib/db')
  const channel = await Channels.findById(req.query.channelId)
  if (!channel) {
    return { redirect: { destination: '/' } }
  }
  const { _id, fee: _fee = 'default', ...rest } = channel?.toJSON()
  const fee = (await Fees.findById(_fee))?.rules || null
  return { props: { channel: { id: _id, fee, ...rest } } }
}
