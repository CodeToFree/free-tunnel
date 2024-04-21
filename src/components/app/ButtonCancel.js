import React from 'react'

import { TokenIcon } from '@/components/ui'
import {
  ConnectButton,
  ContractCallButton,
} from '@/components/web3'

import { EXECUTE_PERIOD } from '@/lib/const'
import { updateRequest } from '@/lib/api'
import AtomicMint from '@/lib/abis/AtomicMint.json'
import AtomicLock from '@/lib/abis/AtomicLock.json'
import { useRequestsMethods } from '@/stores'

import { capitalize } from './lib'

const CANCEL_INFO = {
  'lock-mint': [
    { chain: 'fromChain', abi: AtomicLock, method: 'cancelLock' },
    { chain: 'toChain', abi: AtomicMint, method: 'cancelMint' },
  ],
  'burn-unlock': [
    { chain: 'toChain', abi: AtomicMint, method: 'cancelBurn' },
    { chain: 'fromChain', abi: AtomicLock, method: 'cancelUnlock' },
  ],
}

export default function ButtonCancel ({ action, id: reqId, created, proposer, hash, fromChain, toChain }) {
  const { updateRequestHash } = useRequestsMethods()

  const step = (hash.c1 && hash.p2) ? 1 : 0
  const actionName = capitalize(action.split('-')[step])

  const chain = CANCEL_INFO[action][step].chain === 'fromChain' ? fromChain : toChain
  const contract = chain?.AtomicContract
  const { abi, method } = CANCEL_INFO[action][step]

  const callback = React.useCallback(async hash => {
    updateRequestHash(proposer, reqId, { [step ? 'c2' : 'c1']: hash })
    await updateRequest(proposer, reqId, { hash: { [step ? 'c2' : 'c1']: hash } })
  }, [proposer, reqId, updateRequestHash, step])

  const disabled = Date.now() / 1000 < created + EXECUTE_PERIOD

  console.log(contract, method, reqId.padEnd(66, '0'))

  return (
    <ConnectButton color='info' size='xs' forceChains={[chain]} disabled={disabled}>
      <ContractCallButton
        address={contract}
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
