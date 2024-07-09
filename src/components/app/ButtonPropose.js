import React from 'react'

import { useFreeChannel } from '@/components/AppProvider'
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

const METHODS = {
  'lock-mint': 'proposeMint',
  'burn-unlock': 'proposeUnlock',
  'burn-mint': 'proposeMintFromBurn'
}

export default function ButtonPropose ({ action, proposer, id: reqId, recipient, fromChain, toChain }) {
  const chain = useChain()
  const { channel, contractAddr } = useFreeChannel(chain)
  const toActionName = capitalize(action.split('-')[1])

  const { storeRequestAddHash } = useRequestsMethods()

  const abi = action === 'burn-unlock' ? AtomicLock : AtomicMint
  const method = METHODS[action]
  const callback = React.useCallback(async hash => {
    storeRequestAddHash(channel.id, proposer, reqId, { p2: hash })
    await updateRequest(channel.id, proposer, reqId, { hash: { p2: hash } })
  }, [channel.id, proposer, reqId, storeRequestAddHash])

  return (
    <ConnectButton color='info' size='xs' forceChains={action === 'burn-unlock' ? [fromChain] : [toChain]}>
      <ContractCallButton
        address={contractAddr}
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
