import React from 'react'
import Head from 'next/head'
import { Card, Label, Button, Badge } from 'flowbite-react'

import { AppProvider } from '@/components/AppProvider'
import { AppContainer, PaginationButtons } from '@/components/ui'
import { ChannelList, RequestItem } from '@/components/app'

import { Channels } from '@/lib/db'
import { ADMIN_ADDRS } from '@/lib/const'
import { getAllRequests } from '@/lib/api'
import { parseRequest } from '@/lib/request'
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
  const { storeRequestUpdateAll } = useRequestsMethods()

  React.useEffect(() => {
    getAllRequests().then(reqs => storeRequestUpdateAll(reqs))
  }, [storeRequestUpdateAll])

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

  const allReqs = React.useMemo(() => {
    return requests?.map(({ id, ...rest }) => ({ ...parseRequest(id), ...rest }))
      .sort((x, y) => y.created - x.created) || []
  }, [requests])

  const [tab, setTab] = React.useState('propose')
  const { reqs, nPropose, nSign, nExecute } = React.useMemo(() => {
    const propose = allReqs.filter(req => !req.hash?.p2 && !req.hash?.c1)
    const sign = allReqs.filter(req => !((req.hash?.c2 || !req.hash?.p2) && (req.hash?.c1 || !req.hash?.p1)) && req.hash?.p2) //  && req.signatures?.length < threshold
    const execute = allReqs.filter(req => !((req.hash?.c2 || !req.hash?.p2) && (req.hash?.c1 || !req.hash?.p1)) && !(req.hash?.e2 && req.hash?.e1)) //  && req.signatures?.length >= threshold

    const reqsByTab = { propose, sign, execute }
    return { reqs: reqsByTab[tab], nPropose: propose.length, nSign: sign.length, nExecute: execute.length }
  }, [allReqs, tab])


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
              <Button size='xs' color={tab === 'propose' ? 'info' : 'gray'} className='pr-0' onClick={() => onChangeTab('propose')}>
                Propose {nPropose > 0 && <Badge color='warning' className='ml-1 -mr-0.5 px-1 py-0 rounded-xl text-[10px]'>{nPropose}</Badge>}
              </Button>
              <Button size='xs' color={tab === 'sign' ? 'info' : 'gray'} className='pr-0' onClick={() => onChangeTab('sign')}>
                Sign {nSign > 0 && <Badge color='warning' className='ml-1 -mr-0.5 px-1 py-0 rounded-xl text-[10px]'>{nSign}</Badge>}
              </Button>
              <Button size='xs' color={tab === 'execute' ? 'info' : 'gray'} className='pr-0' onClick={() => onChangeTab('execute')}>
                Execute {nExecute > 0 && <Badge color='warning' className='ml-1 -mr-0.5 px-1 py-0 rounded-xl text-[10px]'>{nExecute}</Badge>}
              </Button>
            </Button.Group>
          </div>
          {!reqs.length && <div className='text-gray-500'>(None)</div>}
          {
            reqs.slice(page * size, (page + 1) * size)
              .map(req => <RequestItem key={`req-${req.id}`} {...req} tokens={[]} role='executor' action='' />)
          }
          {
            reqs?.length > 10 &&
            <PaginationButtons
              page={page}
              pages={Math.ceil(reqs.length / 10)}
              total={reqs.length}
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
