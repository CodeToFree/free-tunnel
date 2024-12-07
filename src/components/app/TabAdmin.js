import React from 'react'
import { useRouter } from 'next/router'
import { Card, Label, Badge } from 'flowbite-react'

import { useChain, useAddress, useContractQuery } from '@/lib/hooks'
import TunnelContract from '@/lib/abis/TunnelContract.json'

import { useFreeTunnel } from '@/components/AppProvider'
import { AppContainer } from '@/components/ui'
import { ConnectedAddress } from '@/components/web3'
import {
  FreeHeader,
  SectionAdmin,
} from '@/components/app'

import Tabs from './Tabs'

export default function TabAdmin() {
  const router = useRouter()
  const chain = useChain()
  const address = useAddress()
  const { tunnel, contractAddr } = useFreeTunnel(chain)

  const { result: admin } = useContractQuery(contractAddr, TunnelContract, 'getAdmin')

  const [isAdmin, setIsAdmin] = React.useState()
  React.useEffect(() => {
    setIsAdmin(address && address === admin)
    if (admin && address !== admin) {
      router.push(`/${router.query.tunnelId}`)
    }
  }, [router, address, admin])

  if (!isAdmin) {
    return <AppContainer Header={FreeHeader} />
  }

  return (
    <AppContainer Header={FreeHeader}>
      <div className='w-[480px] max-w-full'>
        <Tabs isBurnMint={!tunnel.from.length} isAdmin={isAdmin} />

        <Card className='mt-4'>
          <div>
            <div className='mb-2 flex justify-between'>
              <Label value='Connected' />
              <div className='h-4'>
                <Badge color='red'>Admin</Badge>
              </div>
            </div>
            <ConnectedAddress />
          </div>
          <SectionAdmin />
        </Card>
        </div>
    </AppContainer>
  )
}
