import React from 'react'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { Card, Label, Button, Badge } from 'flowbite-react'

import { ROLES, BRIDGE_CHANNEL } from '@/lib/const'
import { useChain, useAddress, useContractQuery } from '@/lib/hooks'
import Permissions from '@/lib/abis/Permissions.json'
import AtomicMint from '@/lib/abis/AtomicMint.json'

import { AppContainer } from '@/components/ui'
import { ConnectedAddress, TokenSelector } from '@/components/web3'
import {
  SectionAdmin,
  SectionPropose,
  CardRequestsForProposer,
  CardRequestsForExecutor,
  capitalize,
} from '@/components/app'

export const ROLE_COLORS = {
  [ROLES.Admin]: 'red', 
  [ROLES.Proposer]: 'info', 
  [ROLES.Executor]: 'success', 
}

export default function Home() {
  const router = useRouter()
  const chain = useChain()
  const address = useAddress()

  const contractAddr = chain?.AtomicContract

  const { result: admin } = useContractQuery(contractAddr, Permissions, 'getAdmin')
  const { result: _proposerIndex } = useContractQuery(contractAddr, Permissions, 'proposerIndex', React.useMemo(() => ([address]), [address]))
  const { result: exes } = useContractQuery(contractAddr, Permissions, 'getActiveExecutors')
  const { result: vault } = useContractQuery(contractAddr, Permissions, 'getVault')

  const [role, setRole] = React.useState()
  const proposerIndex = _proposerIndex?.toNumber()
  React.useEffect(() => {
    if (!address) {
      setRole()
    } else if (address === admin) {
      setRole(ROLES.Admin)
    } else if (proposerIndex > 0) {
      setRole(ROLES.Proposer)
    } else if (exes?.executors.includes(address)) {
      setRole(ROLES.Executor)
    } else if (admin && exes && typeof proposerIndex !== 'number') {
      setRole()
    }
  }, [address, admin, proposerIndex, exes])

  const { result: _tokens } = useContractQuery(contractAddr, AtomicMint, 'getSupportedTokens')
  const tokens = React.useMemo(() => {
    if (!_tokens) {
      return []
    }
    const { supportedTokens, indexes } = _tokens
    return supportedTokens.map((addr, i) => ({ addr, index: indexes[i] }))
  }, [_tokens])

  const [token, setToken] = React.useState()

  return (
    <AppContainer>
      <Head>
        <title>{BRIDGE_CHANNEL}</title>
      </Head>

      <div className='w-[480px] max-w-full'>
        <Button.Group>
          <Button
            color='purple'
            size='sm'
            className='flex-1'
          >
            Lock-Mint
          </Button>
          <Button
            color='gray'
            size='sm'
            className='flex-1'
            onClick={() => router.push('/unlock')}
          >
            Burn-Unlock
          </Button>
        </Button.Group>

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
            <TokenSelector tokens={tokens} noSelect={role === ROLES.Admin} onChange={setToken} />
          </div>
          {role === ROLES.Admin && <SectionAdmin />}
          {(!role || role === ROLES.Proposer) && <SectionPropose action='lock-mint' role={role} token={token} />}
        </Card>
      </div>
      {
        (!role || role === ROLES.Proposer) &&
        <div className='w-[480px] max-w-full shrink-0 lg:mt-[50px]'>
          <CardRequestsForProposer action='lock-mint' proposer={address} role={role} exes={exes} />
        </div>
      }
      {
        role === ROLES.Executor &&
        <div className='w-[480px] max-w-full shrink-0 lg:mt-[50px]'>
          <CardRequestsForExecutor action='lock-mint' exes={exes} />
        </div>
      }
    </AppContainer>
  )
}
