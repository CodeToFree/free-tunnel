import React from 'react'
import Head from 'next/head'

import { useWeb3ModalFromTunnel } from '@/lib/hooks'

import { AppProvider } from '@/components/AppProvider'
import { TabLock } from '@/components/app'

export default function PageTunnelIndex({ tunnel }) {
  const ready = useWeb3ModalFromTunnel(tunnel)
  if (!ready) {
    return
  }

  return (
    <AppProvider tunnel={tunnel}>
      <Head>
        <title>{tunnel.name}</title>
        <link rel='icon' href={tunnel.logo} />
      </Head>
      <TabLock />
    </AppProvider>
  )
}

export const getServerSideProps = async (req) => {
  const { Tunnels, Fees } = await import('@/lib/db')
  const tunnel = await Tunnels.findById(req.query.tunnelId)
  if (!tunnel) {
    return { redirect: { destination: '/' } }
  }
  const { _id, fee: _fee = 'default', ...rest } = tunnel?.toJSON()
  const fee = (await Fees.findById(_fee))?.rules || null
  return { props: { tunnel: { id: _id, fee, ...rest } } }
}
