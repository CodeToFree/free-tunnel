import React from 'react'
import { ethers } from 'ethers'

import { useFreeChannel } from '@/components/AppProvider'
import {
  ConnectButton,
} from '@/components/web3'

import { ROLES } from '@/lib/const'
import { useAddress, useProvider, useContractCall } from '@/lib/hooks'
import { updateRequest } from '@/lib/api'
import AtomicMint from '@/lib/abis/AtomicMint.json'
import AtomicLock from '@/lib/abis/AtomicLock.json'
import { useRequestsMethods } from '@/stores'

import { capitalize } from './lib'

const EXECUTE_INFO = {
  'lock-mint': [
    { chain: 'fromChain', abi: AtomicLock, method: 'executeLock' },
    { chain: 'toChain', abi: AtomicMint, method: 'executeMint' },
  ],
  'burn-unlock': [
    { chain: 'toChain', abi: AtomicMint, method: 'executeBurn' },
    { chain: 'fromChain', abi: AtomicLock, method: 'executeUnlock' },
  ],
  'burn-mint': [
    { chain: 'fromChain', abi: AtomicMint, method: 'executeBurn' },
    { chain: 'toChain', abi: AtomicMint, method: 'executeMint' },
  ],
}

export default function ButtonExecuteWrapper ({ role, action, exes, signatures = [], ...req }) {
  const threshold = exes?.threshold.toNumber() || Infinity
  const underThreshold = signatures.length < threshold
  if (![ROLES.Proposer, ROLES.Executor].includes(role) && underThreshold) {
    return
  }

  const signInfo = (
    <div className='text-xs text-white'>
    {
      !exes
        ? `${signatures.length} Signed`
        : `${signatures.length}/${exes.executors.length} Signed; ${underThreshold ? `${threshold} Required.` : 'Could Execute'}`
    }
    </div>
  )

  if (role !== ROLES.Executor && underThreshold) {
    return signInfo
  }

  return (
    <ButtonExecute action={action} exes={exes} signatures={signatures} underThreshold={underThreshold} {...req}>
      {signInfo}
    </ButtonExecute>
  )
}

function ButtonExecute ({ action, exes, id: reqId, proposer, signatures = [], underThreshold, hash, fromChain, toChain, children }) {
  const executor = useAddress()
  const provider = useProvider()

  const { storeRequestAddSignature, storeRequestAddHash } = useRequestsMethods()

  const step = (hash.e1 || !hash.p1) ? 1 : 0
  const chain = EXECUTE_INFO[action][step].chain === 'fromChain' ? fromChain : toChain
  const { channel, contractAddr } = useFreeChannel(chain)
  const { abi, method } = EXECUTE_INFO[action][step]
  const { pending, call } = useContractCall(contractAddr, abi, method)

  const sign = React.useCallback(async () => {
    const fullReqId = reqId.padEnd(66, '0')
    const sig = await provider.getSigner().signMessage(`[${channel.name}]\nSign to execute a ${action}:\n${fullReqId}`)
    const { compact } = ethers.utils.splitSignature(sig)
    storeRequestAddSignature(channel.id, proposer, reqId, { sig: compact, exe: executor })
    await updateRequest(channel.id, proposer, reqId, { signature: { sig: compact, exe: executor } })
  }, [channel.id, channel.name, reqId, action, provider, storeRequestAddSignature, proposer, executor])

  const exeIndex = exes?.exeIndex.toNumber()
  const execute = React.useCallback(async () => {
    const sigs = signatures.map(({ sig, exe }) => {
      const { r, yParityAndS } = ethers.utils.splitSignature(sig)
      return { r, s: yParityAndS, exe }
    })

    const fullReqId = reqId.padEnd(66, '0')
    const hash = await call([fullReqId, sigs.map(s => s.r), sigs.map(s => s.s), sigs.map(s => s.exe), exeIndex])
    if (hash) {
      if (!step) {
        storeRequestAddHash(channel.id, proposer, reqId, { e1: hash })
        await updateRequest(channel.id, proposer, reqId, { hash: { e1: hash } })
      } else {
        storeRequestAddHash(channel.id, proposer, reqId, { e2: hash })
        await updateRequest(channel.id, proposer, reqId, { hash: { e2: hash } })
      }
    }
  }, [channel.id, reqId, proposer, signatures, exeIndex, call, step, storeRequestAddHash])

  const signed = signatures.find(({ exe }) => exe === executor)
  return (
    <div className='flex items-center gap-2'>
      <ConnectButton
        color='info'
        size='xs'
        onClick={underThreshold ? sign : execute}
        disabled={!exes || (signed && underThreshold)}
        forceChains={!underThreshold && [chain]}
      >
        <ExecuteText underThreshold={underThreshold} signed={signed} step={step} action={action} />
      </ConnectButton>
      {children}
    </div>
  )
}

function ExecuteText ({ underThreshold, signed, step, action }) {
  const fromActionName = capitalize(action.split('-')[0])
  const toActionName = capitalize(action.split('-')[1])

  if (underThreshold) {
    return signed ? 'Signed' : 'Sign to Authorize the Execution'
  }
  return <>Execute&nbsp;<span className={!step && 'underline'}>{fromActionName}</span>-<span className={step && 'underline'}>{toActionName}</span></>
}
