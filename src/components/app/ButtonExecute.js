import React from 'react'
import { ethers } from 'ethers'

import { useFreeTunnel } from '@/components/AppProvider'
import {
  ConnectButton,
} from '@/components/web3'

import { ROLES } from '@/lib/const'
import { useAddress, useProvider, useContractCall } from '@/lib/hooks'
import { updateRequest } from '@/lib/api'
import FreeTunnelHub from '@/lib/abis/FreeTunnelHub.json'
import TunnelContract from '@/lib/abis/TunnelContract.json'
import { useRequestsMethods } from '@/stores'

import { capitalize } from './lib'

const EXECUTE_INFO = {
  'lock-mint': [
    { chain: 'fromChain', method: 'executeLock' },
    { chain: 'toChain', method: 'executeMint' },
  ],
  'burn-unlock': [
    { chain: 'toChain', method: 'executeBurn' },
    { chain: 'fromChain', method: 'executeUnlock' },
  ],
  'burn-mint': [
    { chain: 'fromChain', method: 'executeBurn' },
    { chain: 'toChain', method: 'executeMint' },
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
  const { tunnel, contractAddr, v2 } = useFreeTunnel(chain)
  const callAddress = v2 ? process.env.FREE_TUNNEL_HUB_ADDRESS : contractAddr
  const abi = v2 ? FreeTunnelHub : TunnelContract
  const { method } = EXECUTE_INFO[action][step]
  const { pending, call } = useContractCall(callAddress, abi, method)

  const sign = React.useCallback(async () => {
    const fullReqId = reqId.padEnd(66, '0')
    const sig = await provider.getSigner().signMessage(`[${tunnel.name}]\nSign to execute a ${action}:\n${fullReqId}`)
    const { compact } = ethers.utils.splitSignature(sig)
    storeRequestAddSignature(tunnel.id, proposer, reqId, { sig: compact, exe: executor })
    await updateRequest(tunnel.id, proposer, reqId, { signature: { sig: compact, exe: executor } })
  }, [tunnel.id, tunnel.name, reqId, action, provider, storeRequestAddSignature, proposer, executor])

  const exeIndex = exes?.exeIndex.toNumber()
  const execute = React.useCallback(async () => {
    const sigs = signatures.map(({ sig, exe }) => {
      const { r, yParityAndS } = ethers.utils.splitSignature(sig)
      return { r, s: yParityAndS, exe }
    })

    const fullReqId = reqId.padEnd(66, '0')
    const args = [fullReqId, sigs.map(s => s.r), sigs.map(s => s.s), sigs.map(s => s.exe), exeIndex]
    if (v2) {
      args.unshift(tunnel.name)
    }
    const hash = await call(args)
    if (hash) {
      if (!step) {
        storeRequestAddHash(tunnel.id, proposer, reqId, { e1: hash })
        await updateRequest(tunnel.id, proposer, reqId, { hash: { e1: hash } })
      } else {
        storeRequestAddHash(tunnel.id, proposer, reqId, { e2: hash })
        await updateRequest(tunnel.id, proposer, reqId, { hash: { e2: hash } })
      }
    }
  }, [tunnel.id, v2, tunnel.name, reqId, proposer, signatures, exeIndex, call, step, storeRequestAddHash])

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
