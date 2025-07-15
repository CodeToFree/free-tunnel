import React from 'react'

import { useFreeTunnel } from '@/components/AppProvider'
import { TokenIcon } from '@/components/ui'
import {
  ConnectButton,
  ContractCallButton,
} from '@/components/web3'

import { EXECUTE_PERIOD } from '@/lib/const'
import { updateRequest } from '@/lib/api'
import FreeTunnelHub from '@/lib/abis/FreeTunnelHub.json'
import TunnelContract from '@/lib/abis/TunnelContract.json'
import { useRequestsMethods } from '@/stores'

import { capitalize } from './lib'

const CANCEL_INFO = {
  'lock-mint': [
    { chain: 'fromChain', method: 'cancelLock' },
    { chain: 'toChain', method: 'cancelMint' },
  ],
  'burn-unlock': [
    { chain: 'toChain', method: 'cancelBurn' },
    { chain: 'fromChain', method: 'cancelUnlock' },
  ],
  'burn-mint': [
    { chain: 'fromChain', method: 'cancelBurn' },
    { chain: 'toChain', method: 'cancelMint' },
  ],
}

export default function ButtonCancel ({ action, id: reqId, created, proposer, hash, fromChain, toChain }) {
  const { storeRequestAddHash } = useRequestsMethods()

  const step = (hash.c1 && hash.p2) ? 1 : 0
  const actionName = capitalize(action.split('-')[step])

  const chain = CANCEL_INFO[action][step].chain === 'fromChain' ? fromChain : toChain
  const { tunnel, contractAddr, v2 } = useFreeTunnel(chain)
  const callAddress = v2 ? process.env.FREE_TUNNEL_HUB_ADDRESS : contractAddr
  const abi = v2 ? FreeTunnelHub : TunnelContract
  const { method } = CANCEL_INFO[action][step]
  const args = React.useMemo(() => {
    if (v2) {
      return [tunnel.name, reqId.padEnd(66, '0')]
    } else {
      return [reqId.padEnd(66, '0')]
    }
  }, [v2, tunnel.name, reqId])

  const callback = React.useCallback(async hash => {
    storeRequestAddHash(tunnel.id, proposer, reqId, { [step ? 'c2' : 'c1']: hash })
    await updateRequest(tunnel.id, proposer, reqId, { hash: { [step ? 'c2' : 'c1']: hash } })
  }, [tunnel.id, proposer, reqId, storeRequestAddHash, step])

  const disabled = Date.now() / 1000 < created + EXECUTE_PERIOD

  return (
    <ConnectButton color='info' size='xs' forceChains={[chain]} disabled={disabled}>
      <ContractCallButton
        address={callAddress}
        abi={abi}
        method={method}
        args={args}
        callback={callback}
      >
        Cancel {actionName} on <TokenIcon size='sm' chain={chain} className='mx-1' /> {chain?.name}
      </ContractCallButton>
    </ConnectButton>
  )
}
