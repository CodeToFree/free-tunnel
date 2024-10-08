import React from 'react'
import Head from 'next/head'
import { Card, Label, Button, Badge } from 'flowbite-react'

import { AppProvider } from '@/components/AppProvider'
import { AppContainer, PaginationButtons } from '@/components/ui'
import { ChannelList, RequestItem } from '@/components/app'

import { Channels } from '@/lib/db'
import { ADMIN_ADDRS, ROLES } from '@/lib/const'
import { getAllRequests } from '@/lib/api'
import { useAllPendingRequests, useRequestsMethods } from '@/stores'
import { useWeb3ModalFromChannel, useAddress } from '@/lib/hooks'

export default function PageHome({ channels }) {
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
      <Home channels={channels} />
    </AppProvider>
  )
}

function Home ({ channels }) {
  const address = useAddress()
  const isAdmin = ADMIN_ADDRS.includes(address)

  return (
    <AppContainer>
      <div className='w-[480px] max-w-full'>
        <div className='text-white h-[34px] text-lg font-medium'>Select a Channel</div>
        <ChannelList channels={channels} className='mt-4 text-white' />
      </div>
      {isAdmin && <PendingRequests channels={channels} />}
    </AppContainer>
  )
}

function PendingRequests({ channels }) {
  const requests = useAllPendingRequests(channels)
  const { storeRequestUpdateAll } = useRequestsMethods()

  React.useEffect(() => {
    getAllRequests().then(reqs => storeRequestUpdateAll(reqs))
  }, [storeRequestUpdateAll])


  const [tab, setTab] = React.useState('')
  const { keys, nReqs } = React.useMemo(() => {
    const keys = Object.keys(requests)
    const nReqs = Object.fromEntries(keys.map(k => [k, requests[k].length]))
    return { keys, nReqs }
  }, [requests])

  const size = 10
  const [page, setPage] = React.useState(0)

  const onChangeTab = React.useCallback(tab => {
    setPage(0)
    setTab(tab)
  }, [])

  return (
    <div className='w-[480px] max-w-full shrink-0 lg:mt-[50px]'>
      <Card>
        <div>
          <div className='mb-2 flex items-center justify-between'>
            <Label value='Requests' />
          </div>
          <div className='mb-3'>
            <Button.Group className='w-auto'>
            {
              keys.map(k => (
                <Button key={k} size='xs' color={tab === k ? 'info' : 'gray'} className='pr-0' onClick={() => onChangeTab(k)}>
                  {k} {nReqs[k] > 0 && <Badge color='warning' className='ml-1 -mr-0.5 px-1 py-0 rounded-xl text-[10px]'>{nReqs[k]}</Badge>}
                </Button>
              ))
            }
            </Button.Group>
          </div>
          {!nReqs[tab] && <div className='text-gray-500'>(None)</div>}
          {
            requests[tab]?.slice(page * size, (page + 1) * size)
              .map(req => <RequestItem key={`req-${req.id}`} {...req} tokens={[]} role={ROLES.Proposer} />)
          }
          {
            nReqs[tab] > 10 &&
            <PaginationButtons
              page={page}
              pages={Math.ceil(nReqs[tab].length / 10)}
              total={nReqs[tab]}
              onPageChange={setPage}
            />
          }
        </div>
      </Card>
    </div>
  )
}

export const getServerSideProps = async (req) => {
  const result = await Channels.find().sort({ priority: -1 }).select('_id name logo from to contracts')
  const channels = result.map(({ _id, name, logo, from, to, contracts }) => ({ id: _id, name, logo, from, to, contracts }))
  return { props: { channels } }
}
