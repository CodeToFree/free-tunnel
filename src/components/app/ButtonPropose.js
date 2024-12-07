import React from 'react'

import { useFreeTunnel } from '@/components/AppProvider'
import { TokenIcon } from '@/components/ui'
import {
  ConnectButton,
  ContractCallButton,
} from '@/components/web3'

import { useChain } from '@/lib/hooks'
import { updateRequest } from '@/lib/api'
import FreeTunnelHub from '@/lib/abis/FreeTunnelHub.json'
import TunnelContract from '@/lib/abis/TunnelContract.json'
import { useRequestsMethods } from '@/stores'

import { capitalize } from './lib'

const METHODS = {
  'lock-mint': 'proposeMint',
  'burn-unlock': 'proposeUnlock',
  'burn-mint': 'proposeMintFromBurn'
}

export default function ButtonPropose ({ action, proposer, id: reqId, recipient, fromChain, toChain }) {
  const chain = useChain()
  const { tunnel, contractAddr, v2 } = useFreeTunnel(chain)
  const toActionName = capitalize(action.split('-')[1])

  const { storeRequestAddHash } = useRequestsMethods()

  const abi = v2 ? FreeTunnelHub : TunnelContract
  const method = METHODS[action]
  const args = React.useMemo(() => {
    if (v2) {
      return [tunnel.name, reqId.padEnd(66, '0'), recipient]
    } else {
      return [reqId.padEnd(66, '0'), recipient]
    }
  }, [v2, tunnel.name, reqId, recipient])

  const callback = React.useCallback(async hash => {
    storeRequestAddHash(tunnel.id, proposer, reqId, { p2: hash })
    await updateRequest(tunnel.id, proposer, reqId, { hash: { p2: hash } })
  }, [tunnel.id, proposer, reqId, storeRequestAddHash])

  return (
    <ConnectButton color='info' size='xs' forceChains={action === 'burn-unlock' ? [fromChain] : [toChain]}>
      <ContractCallButton
        address={v2 ? process.env.FREE_TUNNEL_HUB_ADDRESS : contractAddr}
        abi={abi}
        method={method}
        args={args}
        callback={callback}
      >
        Propose {toActionName} on <TokenIcon size='sm' token={chain?.icon} className='mx-1' /> {chain?.name}
      </ContractCallButton>
    </ConnectButton>
  )
}
