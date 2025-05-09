import React from 'react'
import { useRouter } from 'next/router'
import { Card, Label, Badge } from 'flowbite-react'

import { ROLES } from '@/lib/const'
import { useChain, useAddress, useContractQuery } from '@/lib/hooks'
import TunnelContract from '@/lib/abis/TunnelContract.json'

import { useFreeTunnel } from '@/components/AppProvider'
import { AppContainer } from '@/components/ui'
import { ConnectedAddress, TokenSelector } from '@/components/web3'
import {
  FreeHeader,
  SectionPropose,
  CardRequestsForProposer,
  CardRequestsForExecutor,
  capitalize,
} from '@/components/app'

import Tabs from './Tabs'
import { ROLE_COLORS } from './TabLock'

export default function TabUnlock() {
  const router = useRouter()
  const chain = useChain()
  const address = useAddress()
  const { tunnel, contractAddr } = useFreeTunnel(chain)

  React.useEffect(() => {
    if (!tunnel.from.length) {
      router.replace(`/${router.query.tunnelId}`)
    }
  }, [router, tunnel.from.length])

  const { result: admin } = useContractQuery(contractAddr, TunnelContract, 'getAdmin')
  const { result: vault } = useContractQuery(contractAddr, TunnelContract, 'getVault')
  const { result: _proposerIndex } = useContractQuery(contractAddr, TunnelContract, 'proposerIndex', React.useMemo(() => ([address]), [address]))
  const { result: exes } = useContractQuery(contractAddr, TunnelContract, 'getActiveExecutors')

  const [isAdmin, setIsAdmin] = React.useState()
  const [role, setRole] = React.useState()
  const proposerIndex = _proposerIndex?.toNumber()

  React.useEffect(() => {
    setIsAdmin(address && address == admin)
  }, [address, admin])
  React.useEffect(() => {
    if (!address) {
      setRole()
    } else if (proposerIndex > 0) {
      setRole(ROLES.Proposer)
    } else if (exes?.executors.includes(address)) {
      setRole(ROLES.Executor)
    } else if (address === vault) {
      setRole(ROLES.Vault)
    } else if (exes && typeof proposerIndex !== 'number') {
      setRole()
    }
  }, [address, vault, proposerIndex, exes])

  const { result: _tokens } = useContractQuery(contractAddr, TunnelContract, 'getSupportedTokens')
  const tokens = React.useMemo(() => {
    if (!_tokens) {
      return []
    }
    const { supportedTokens, indexes } = _tokens
    return supportedTokens.map((addr, i) => ({ id: addr, addr, index: indexes[i] }))
  }, [_tokens])

  const [token, setToken] = React.useState()

  if (!tunnel.from.length) {
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
                {role && <Badge color={ROLE_COLORS[role]}>{capitalize(role)}</Badge>}
              </div>
            </div>
            <ConnectedAddress />
          </div>
          <div>
            <div className='mb-2 flex'>
              <Label value='Tokens' />
            </div>
            <TokenSelector options={tokens} noSelect={role === ROLES.Admin} onChange={setToken} />
          </div>
          {(!role || role === ROLES.Proposer || role === ROLES.Vault) && <SectionPropose action='burn-unlock' role={role} token={token} />}
        </Card>
      </div>
      {
        (!role || role === ROLES.Proposer) &&
        <div className='w-[480px] max-w-full shrink-0 lg:mt-[50px]'>
          <CardRequestsForProposer action='burn-unlock' tokens={tokens} proposer={address} role={role} exes={exes} />
        </div>
      }
      {
        role === ROLES.Executor &&
        <div className='w-[480px] max-w-full shrink-0 lg:mt-[50px]'>
          <CardRequestsForExecutor action='burn-unlock' tokens={tokens} exes={exes} />
        </div>
      }
    </AppContainer>
  )
}
