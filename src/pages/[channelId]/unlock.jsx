import React from 'react'
import Head from 'next/head'

import { createWeb3Modal, defaultConfig } from '@web3modal/ethers5/react'
import { DARK_MODE, CHAINS } from '@/lib/const'

import { Channels } from '@/lib/db'

import { AppProvider } from '@/components/AppProvider'
import { TabUnlock } from '@/components/app'

export default function PageChannelUnlock({ channel }) {
  const channelId = channel?.id

  const [ready, setReady] = React.useState(false)

  const chains = React.useMemo(() => {
    if (!channelId) {
      return []
    }
    return [...channel.from, ...channel.to].map(id => CHAINS.find(c => c.id === id))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [channelId])

  React.useEffect(() => {
    if (!channelId) {
      return
    }

    const projectId = process.env.NEXT_PUBLIC_WC_PROJECT_ID || '';

    const metadata = {
      name: 'Free Atomic Lock-Mint',
      description: '',
      url: '',
      icons: ['/logo.png'],
    }

    createWeb3Modal({
      projectId,
      themeMode: DARK_MODE ? 'dark' : 'light',
      chains: chains.filter(c => c.chainId !== 'tron'),
      chainImages: Object.fromEntries(chains.map(c => [c.chainId, `/tokens/${c.icon}.png`])),
      ethersConfig: defaultConfig({ metadata }),
      excludeWalletIds: [
        'a797aa35c0fadbfc1a53e7f675162ed5226968b44a19ee3d24385c64d1d3c393'
      ],
      themeVariables: {
        '--w3m-accent': '#6335FF',
      }
    })

    setReady(true)
  }, [channelId, chains])

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
    return { props: {} }
  }
  const { _id, ...rest } = channel?.toJSON()
  return { props: { channel: { id: _id, ...rest } } }
}