import React from 'react'
import Head from 'next/head'
import { Card, Label, Button, Badge } from 'flowbite-react'

import { AppProvider } from '@/components/AppProvider'
import { AppContainer, PaginationButtons } from '@/components/ui'
import { TunnelList, RequestItem } from '@/components/app'

import { Tunnels } from '@/lib/db'
import { ADMIN_ADDRS, ROLES } from '@/lib/const'
import { getAllRequests } from '@/lib/api'
import { useAllPendingRequests, useRequestsMethods } from '@/stores'
import { useWeb3ModalFromTunnel, useAddress } from '@/lib/hooks'

export default function PageHome({ tunnels }) {
  const ready = useWeb3ModalFromTunnel()
  if (!ready) {
    return
  }

  return (
    <AppProvider>
      <Head>
        <title>Free Tunnel</title>
        <link rel='icon' href='/free.png' />
      </Head>
      <Home tunnels={tunnels} />
    </AppProvider>
  )
}

function Home ({ tunnels }) {
  const address = useAddress()
  const isAdmin = ADMIN_ADDRS.includes(address)

  const pendingRequests = usePendingRequests(isAdmin, tunnels)

  return (
    <AppContainer fullscreen>
      <TunnelList
        tunnels={tunnels}
        badges={pendingRequests}
        className='-my-[10px] w-[1188px] max-w-full h-[802px] md:max-h-[calc(100vh-120px)] border border-gray-500 rounded-2xl'
        SidePanel={isAdmin && PendingRequests}
      />
    </AppContainer>
  )
}


function usePendingRequests(isAdmin, tunnels) {
  const requests = useAllPendingRequests(tunnels)
  const { storeRequestUpdateAll } = useRequestsMethods()

  React.useEffect(() => {
    if (isAdmin) {
      getAllRequests().then(reqs => storeRequestUpdateAll(reqs))
    }
  }, [isAdmin, storeRequestUpdateAll])

  return React.useMemo(() => {
    if (!isAdmin) {
      return
    }
    const keys = Object.keys(requests)
    return Object.fromEntries(keys.map(k => [k, requests[k].length]))
  }, [isAdmin, requests])
}

function PendingRequests({ tunnels, tunnelId }) {
  const requests = useAllPendingRequests(tunnels)

  const nReqs = requests[tunnelId]?.length || 0

  const size = 10
  const [page, setPage] = React.useState(0)

  return (
    <div className='flex flex-col h-full'> 
      <h3 className='text-xl font-semibold p-4'>
        Pending Requests
      </h3>
      {!nReqs && <div className='flex justify-center px-4 py-10 text-gray-500'>(None)</div>}
      <div className='flex-1 px-4 pb-4 overflow-y-auto'>
      {
        requests[tunnelId]?.slice(page * size, (page + 1) * size)
          .map(req => <RequestItem key={`req-${req.id}`} {...req} tokens={[]} role={ROLES.Proposer} />)
      }
      {
        nReqs > 10 &&
        <PaginationButtons
          page={page}
          pages={Math.ceil(nReqs.length / 10)}
          total={nReqs}
          onPageChange={setPage}
        />
      }
      </div>
    </div>
  )
}

export const getServerSideProps = async (req) => {
  const result = await Tunnels.find().sort({ priority: -1 }).select('_id name logo lock mint from to contracts')
  const tunnels = result.map(({ _id, name, logo, lock, mint, from, to, contracts }) => ({ id: _id, name, logo, lock, mint, from, to, contracts }))
  return { props: { tunnels } }
}
