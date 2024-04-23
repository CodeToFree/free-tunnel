import React from 'react'
import { ethers } from 'ethers'

import {
  ConnectButton,
} from '@/components/web3'

import { BRIDGE_CHANNEL, ROLES } from '@/lib/const'
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
}

export default function ButtonExecuteWrapper ({ role, action, exes, ...req }) {
  const underThreshold = (req.signatures || []).length < (exes?.threshold.toNumber() || Infinity)
  if (role === ROLES.Proposer && underThreshold) {
    return
  }
  return <ButtonExecute action={action} exes={exes} {...req} />
}

function ButtonExecute ({ action, exes, id: reqId, proposer, signatures = [], hash, fromChain, toChain }) {
  const executor = useAddress()
  const provider = useProvider()

  const { addRequestSignature, updateRequestHash } = useRequestsMethods()

  const step = (hash.e1 || !hash.p1 || toChain.atomicId === 16) ? 1 : 0
  const chain = EXECUTE_INFO[action][step].chain === 'fromChain' ? fromChain : toChain
  const contract = chain?.AtomicContract
  const { abi, method } = EXECUTE_INFO[action][step]
  const { pending, call } = useContractCall(contract, abi, method)

  const sign = React.useCallback(async () => {
    const fullReqId = reqId.padEnd(66, '0')
    const sig = await provider.getSigner().signMessage(`[${BRIDGE_CHANNEL}]\nSign to execute a ${action}:\n${fullReqId}`)
    const { compact } = ethers.utils.splitSignature(sig)
    addRequestSignature(proposer, reqId, { sig: compact, exe: executor })
    await updateRequest(proposer, reqId, { signature: { sig: compact, exe: executor } })
  }, [reqId, action, provider, addRequestSignature, proposer, executor])

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
        updateRequestHash(proposer, reqId, { e1: hash })
        await updateRequest(proposer, reqId, { hash: { e1: hash } })
      } else {
        updateRequestHash(proposer, reqId, { e2: hash })
        await updateRequest(proposer, reqId, { hash: { e2: hash } })
      }
    }
  }, [reqId, proposer, signatures, exeIndex, call, step, updateRequestHash])

  const signed = signatures.find(({ exe }) => exe === executor)
  const threshold = exes?.threshold.toNumber()
  const underThreshold = signatures.length < threshold
  return (
    <div className='flex items-center'>
      <ConnectButton
        color='info'
        size='xs'
        onClick={underThreshold ? sign : execute}
        disabled={!exes || (signed && underThreshold)}
        forceChains={[chain]}
      >
        <ExecuteText underThreshold={underThreshold} signed={signed} step={step} action={action} />
      </ConnectButton>
      <div className='ml-2 text-xs text-white'>
      {
        !exes
          ? 'Loading executor configurations...'
          : `${signatures.length}/${exes.executors.length} Signed; ${underThreshold ? `${threshold} Required.` : 'Could Execute'}`
      }
      </div>
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
