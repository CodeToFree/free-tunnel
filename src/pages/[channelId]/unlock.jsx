import React from 'react'
import Head from 'next/head'

import { Channels } from '@/lib/db'
import { useWeb3ModalFromChannel } from '@/lib/hooks'

import { AppProvider } from '@/components/AppProvider'
import { TabUnlock } from '@/components/app'

export default function PageChannelUnlock({ channel }) {
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
      <TabUnlock />
    </AppProvider>
  )
}

export const getServerSideProps = async (req) => {
  const channel = await Channels.findById(req.query.channelId)
  if (!channel) {
    return { redirect: { destination: '/' } }
  }
  const { _id, ...rest } = channel?.toJSON()
  return { props: { channel: { id: _id, ...rest } } }
}
