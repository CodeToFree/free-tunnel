import React from 'react'

import { TokenIcon } from '@/components/ui'
import {
  ConnectButton,
  ContractCallButton,
} from '@/components/web3'

import { useChain } from '@/lib/hooks'
import { updateRequest } from '@/lib/api'
import AtomicMint from '@/lib/abis/AtomicMint.json'
import AtomicLock from '@/lib/abis/AtomicLock.json'
import { useRequestsMethods } from '@/stores'

import { capitalize } from './lib'

export default function ButtonPropose ({ action, proposer, id: reqId, recipient, fromChain, toChain }) {
  const chain = useChain()
  const toActionName = capitalize(action.split('-')[1])

  const { updateRequestHash } = useRequestsMethods()

  const contract = chain?.AtomicContract
  const abi = action === 'lock-mint' ? AtomicMint : AtomicLock
  const method = action === 'lock-mint' ? 'proposeMint' : 'proposeUnlock'
  const callback = React.useCallback(async hash => {
    updateRequestHash(proposer, reqId, { p2: hash })
    await updateRequest(proposer, reqId, { hash: { p2: hash } })
  }, [proposer, reqId, updateRequestHash])

  return (
    <ConnectButton color='info' size='xs' forceChains={action === 'lock-mint' ? [toChain] : [fromChain]}>
      <ContractCallButton
        address={contract}
        abi={abi}
        method={method}
        args={[reqId.padEnd(66, '0'), recipient]}
        callback={callback}
      >
        Propose {toActionName} on <TokenIcon size='sm' token={chain?.icon} className='mx-1' /> {chain?.name}
      </ContractCallButton>
    </ConnectButton>
  )
}
