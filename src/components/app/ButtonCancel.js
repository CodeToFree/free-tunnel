import React from 'react'

import { useFreeTunnel } from '@/components/AppProvider'
import { TokenIcon } from '@/components/ui'
import {
  ConnectButton,
  ContractCallButton,
} from '@/components/web3'

import { EXECUTE_PERIOD } from '@/lib/const'
import { updateRequest } from '@/lib/api'
import TunnelContract from '@/lib/abis/TunnelContract.json'
import { useRequestsMethods } from '@/stores'

import { capitalize } from './lib'

const CANCEL_INFO = {
  'lock-mint': [
    { chain: 'fromChain', abi: TunnelContract, method: 'cancelLock' },
    { chain: 'toChain', abi: TunnelContract, method: 'cancelMint' },
  ],
  'burn-unlock': [
    { chain: 'toChain', abi: TunnelContract, method: 'cancelBurn' },
    { chain: 'fromChain', abi: TunnelContract, method: 'cancelUnlock' },
  ],
  'burn-mint': [
    { chain: 'fromChain', abi: TunnelContract, method: 'cancelBurn' },
    { chain: 'toChain', abi: TunnelContract, method: 'cancelMint' },
  ],
}

export default function ButtonCancel ({ action, id: reqId, created, proposer, hash, fromChain, toChain }) {
  const { storeRequestAddHash } = useRequestsMethods()

  const step = (hash.c1 && hash.p2) ? 1 : 0
  const actionName = capitalize(action.split('-')[step])

  const chain = CANCEL_INFO[action][step].chain === 'fromChain' ? fromChain : toChain
  const { tunnel, contractAddr } = useFreeTunnel(chain)
  const { abi, method } = CANCEL_INFO[action][step]

  const callback = React.useCallback(async hash => {
    storeRequestAddHash(tunnel.id, proposer, reqId, { [step ? 'c2' : 'c1']: hash })
    await updateRequest(tunnel.id, proposer, reqId, { hash: { [step ? 'c2' : 'c1']: hash } })
  }, [tunnel.id, proposer, reqId, storeRequestAddHash, step])

  const disabled = Date.now() / 1000 < created + EXECUTE_PERIOD

  return (
    <ConnectButton color='info' size='xs' forceChains={[chain]} disabled={disabled}>
      <ContractCallButton
        address={contractAddr}
        abi={abi}
        method={method}
        args={[reqId.padEnd(66, '0')]}
        callback={callback}
      >
        Cancel {actionName} on <TokenIcon size='sm' token={chain?.icon} className='mx-1' /> {chain?.name}
      </ContractCallButton>
    </ConnectButton>
  )
}
