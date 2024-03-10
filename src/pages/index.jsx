import React from 'react'
import Head from 'next/head'
import { Card, Label } from 'flowbite-react'

import { AppContainer } from '@/components/ui'
import {
  ConnectButton,
  ConnectedAddress,
  TokenSelector,
  TokenBalance,
  ApprovalGuard
} from '@/components/web3'

const SPENDER = '0x25aB3Efd52e6470681CE037cD546Dc60726948D3'

export default function Home() {
  const [token, setToken] = React.useState()

  return (
    <AppContainer>
      <Head>
        <title>Atomic Lock-Mint</title>
      </Head>
      <Card className='bg-white/80 dark:bg-gray-900/50 backdrop-blur border border-white dark:border-gray-700 rounded-2xl shadow-2xl min-h-[526px] max-h-[600px] overflow-y-auto'>
        <div>
          <div className='mb-1 block'>
            <Label className='text-xs text-primary-400 dark:text-gray-400' value='From' />
          </div>
          <ConnectedAddress />
        </div>

        <div>
          <div className='mb-1 block'>
            <Label className='text-xs text-primary-400 dark:text-gray-400' value='Token' />
          </div>
          <TokenSelector onChange={setToken} />
        </div>

        <div className='text-xs text-primary-400 dark:text-gray-400'>
          Balance: <TokenBalance token={token} />
        </div>

        <ConnectButton size='lg' color='purple'>
          <ApprovalGuard token={token} spender={SPENDER} required={1000 * 1e6} onClick={() => console.log('confirm')}>
            Confirm
          </ApprovalGuard>
        </ConnectButton>
      </Card>
    </AppContainer>
  )
}
