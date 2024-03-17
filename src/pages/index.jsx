import React from 'react'
import Head from 'next/head'
import { Card, Label, TextInput, Button } from 'flowbite-react'

import { AppContainer, TokenIcon } from '@/components/ui'
import {
  ConnectButton,
  ConnectedAddress,
  TokenSelector,
  TokenBalance,
  MaxButton,
  ApprovalGuard,
} from '@/components/web3'

import { useAddress } from '@/lib/hooks'
import { newRequestId } from '@/lib/request'
import { useBoundStore } from '@/stores'

const SPENDER = '0x0d12d15b26a32e72A3330B2ac9016A22b1410CB6'
// const SPENDER = '0x25aB3Efd52e6470681CE037cD546Dc60726948D3'

export default function Home() {
  const address = useAddress()
  const [token, setToken] = React.useState()
  const [amount, setAmount] = React.useState('')
  const [balance, setBalance] = React.useState()

  const addReuest = useBoundStore((state) => state.addReuest)
  const requests = useBoundStore((state) => state.requests)
  React.useEffect(() => setAmount(''), [token])

  const reqId = React.useMemo(() => newRequestId(amount), [amount])

  return (
    <AppContainer>
      <Head>
        <title>Atomic Lock-Mint</title>
      </Head>

      <Button.Group>
        <Button
          color='purple'
          size='sm'
          className='flex-1'
          onClick={() => router.push('/')}
        >
          Lock-Mint
        </Button>
        <Button
          color='gray'
          size='sm'
          className='flex-1'
        >
          Burn-Unlock
        </Button>
      </Button.Group>

      <Card className='mt-4 max-h-[600px]'>
        <div>
          <div className='mb-1 block'>
            <Label value='Connected' />
          </div>
          <ConnectedAddress />
        </div>

        <div>
          <div className='mb-1 block'>
            <Label value='Token' />
          </div>
          <TokenSelector onChange={setToken} />
        </div>

        <div>
          <div className='mt-1.5 mb-1 flex justify-between'>
            <Label value='Amount' />
            <Label>
              Your Balance: <TokenBalance token={token} className='text-primary' onUpdate={setBalance} />
            </Label>
          </div>
          <div className='relative'>
            <TextInput
              id='amount'
              type='text'
              value={amount}
              onChange={evt => setAmount(evt.target.value)}
            />
            <MaxButton className='absolute top-2 right-2.5' balance={balance} onMax={setAmount} />
          </div>
        </div>


        <div>
          <div className='mt-1.5 mb-1 flex justify-between'>
            <Label value='Request ID' />
            <Label>Clear</Label>
          </div>
          <div className='relative'>
            <TextInput
              id='amount'
              type='text'
              disabled
              value={reqId}
            />
          </div>
        </div>

        <Button
          color='info'
          onClick={() => {
            // TODO: store request
            if (address && reqId) {
              const otherData = {}
              addReuest({ address, id: reqId, ...otherData })
              // xxx.saveReqForAddress(address, { id: reqId, ...otherData })
            }
          }}
        >Store Request</Button>

        <div>
          <div className='mb-1 block'>
            <Label value='Lock' />
          </div>
          <div className='flex justify-between'>
            <div className='flex items-center text-white'>
              <TokenIcon token='eth' />
              {Number(amount) ? `${amount} ${token}` : <span className='text-gray-500'>(N/A)</span>}
            </div>
            <ConnectButton size='xs' color='info'>
              <ApprovalGuard
                token={token}
                input={amount}
                balance={balance?.value}
                decimals={balance?.decimals}
                spender={SPENDER}
                onClick={() => window.alert('Confirm button clicked')}
              >
                Propose Lock
              </ApprovalGuard>
            </ConnectButton>
          </div>
        </div>

        <div>
          <div className='mb-1 block'>
            <Label value='Mint' />
          </div>
          <div className='flex justify-between'>
            <div className='flex items-center text-white'>
              <TokenIcon token='b2' />
              {Number(amount) ? `${amount} ${token}` : <span className='text-gray-500'>(N/A)</span>}
            </div>
            <Button size='xs' color='info' onClick={() => {}}>Propose Lock</Button>
          </div>
        </div>
      </Card>

      <Card className='mt-4'>
        <div>
          <div className='mb-1 block'>
            <Label value='Recent Requests' />
          </div>
          <div className='text-gray-500'>(None)</div>
          {requests.map((req, index) => <div key={index}>
            <div className='mb-2'>
              <div>
                Address: {req.address}
              </div>
              <div>
                ID: {req.id}
              </div>
            </div>
          </div>)}
          {/* Should display stored requests for current address in a list */}
        </div>
      </Card>
    </AppContainer>
  )
}
