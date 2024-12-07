import React from 'react'
import { Label, TextInput, Checkbox } from 'flowbite-react'
import { ethers } from 'ethers'

import { useFreeTunnel } from '@/components/AppProvider'
import { TokenIcon } from '@/components/ui'
import {
  ConnectButton,
  TokenSelector,
  TokenBalance,
  MaxButton,
  ApprovalGuard,
} from '@/components/web3'

import { ADDR_ONE } from '@/lib/const'
import { useChain, useAddress, useContractCall } from '@/lib/hooks'
import { newRequestId, parseRequest } from '@/lib/request'
import { getTunnelRequests, getRequests, postRequest } from '@/lib/api'
import TunnelContract from '@/lib/abis/TunnelContract.json'
import { useRequestsMethods } from '@/stores'

import { capitalize } from './lib'

const METHODS = {
  'lock-mint': 'proposeLock',
  'burn-unlock': 'proposeBurn',
  'burn-mint': 'proposeBurnForMint'
}

export default function SectionPropose ({ action = 'lock-mint', role, token }) {
  const chain = useChain()
  const { tunnel, contractAddr } = useFreeTunnel(chain)
  const fromActionName = capitalize(action.split('-')[0])
  const toActionName = capitalize(action.split('-')[1])

  const proposer = useAddress()
  const [amount, setAmount] = React.useState('')
  const [balance, setBalance] = React.useState()
  const [recipient, setRecipient] = React.useState('')

  const forceChains = action === 'lock-mint' ? tunnel.from : tunnel.to
  const targetChains = action === 'burn-unlock' ? tunnel.from : tunnel.to
  const tokenPath = tunnel?.paths?.[token?.index]
  const targets = React.useMemo(() => {
    return targetChains.filter(c => c.id !== chain?.id && (tokenPath ? tokenPath.includes(c.hubId) : true))
  }, [chain?.id, targetChains, tokenPath])
  const [target, setTarget] = React.useState(targets[0])

  React.useEffect(() => {
    setAmount('')
  }, [token])

  const vaultLimit = tunnel.vault?.[token?.index] || 0
  const useVault = Boolean(vaultLimit) && (Number(amount) >= vaultLimit)

  const from = action === 'burn-unlock' ? target?.hubId : chain?.hubId
  const to = action === 'burn-unlock' ? chain?.hubId : target?.hubId
  const reqId = React.useMemo(
    () => newRequestId(action, amount, token?.index, from, to, useVault),
    [action, amount, token?.index, from, to, useVault]
  )
  const { storeRequestAdd, storeRequestUpdateForProposer, storeRequestUpdateForTunnel } = useRequestsMethods()
  React.useEffect(() => {
    if (proposer) {
      if (role) {
        getTunnelRequests(tunnel.id).then(reqs => storeRequestUpdateForTunnel(tunnel.id, reqs))
      } else {
        getRequests(tunnel.id, proposer).then(reqs => storeRequestUpdateForProposer(tunnel.id, proposer, reqs))
      }
    }
  }, [tunnel.id, proposer, role, storeRequestUpdateForProposer, storeRequestUpdateForTunnel])

  const abi = action === 'lock-mint' ? TunnelContract : TunnelContract
  const method = METHODS[action]

  let bridgeFee = '0'
  if (!role && tunnel.fee) {
    const fee = tunnel.fee
    bridgeFee = fee[`${chain?.id}>${target?.id}`] || fee[`${chain?.id}>`] || fee[`>${target?.id}`] || fee.default || '0'
  }
  const value = reqId && token?.addr === ADDR_ONE
    ? ethers.utils.parseEther(parseRequest(reqId).value)
    : ethers.utils.parseEther(bridgeFee)
  const { pending, call } = useContractCall(contractAddr, abi, method, [reqId.padEnd(66, '0'), { value }])
  const coreCheck = React.useMemo(() => ({ require: bridgeFee, alert: `Low ${chain?.currency} for Bridge Fee` }), [bridgeFee, chain?.currency])

  if (!proposer) {
    return <ConnectButton color='purple' forceChains={forceChains} />
  }

  const min = tunnel.min?.[token?.index] || 0
  const belowAmount = amount && (Number(amount) < min)

  return (
    <>
      <div>
        <div className='mb-2 flex justify-between'>
          <Label value='Amount' />
          <Label>
            Your Balance: <TokenBalance tokenAddr={token?.addr} className='text-primary' onUpdate={setBalance} />
          </Label>
        </div>
        <div className='relative'>
          <TextInput
            id='amount'
            type='text'
            value={amount}
            onChange={evt => setAmount(evt.target.value)}
          />
          <MaxButton className='absolute top-2 right-2.5' balance={balance} onMax={setAmount} />
        </div>
        {
          belowAmount &&
          <div className='mt-1 text-sm text-red-400'>At least {min} required</div>
        }
        {
          useVault &&
          <div className='mt-1 text-sm text-white'>Fund will be saved to vault</div>
        }
      </div>

      <div>
        <div className='mb-2 flex'>
          <Label value={`Receive ${toActionName} on`} />
        </div>
        <TokenSelector tokens={targets.map(t => ({ ...t, addr: t.hubId }))} onChange={setTarget} />
      </div>

      <div>
        <div className='mb-2 flex justify-between'>
          <Label value='Recipient Address' />
        </div>
        <div className='relative'>
          <TextInput
            id='recipient'
            type='text'
            value={recipient}
            onChange={evt => setRecipient(evt.target.value)}
            placeholder={`Default: ${proposer}`}
          />
        </div>
      </div>

      <div>
        <div className='mb-2 flex justify-between'>
          <Label value='Request ID' />
        </div>
        <div className='relative'>
          <TextInput
            id='amount'
            type='text'
            disabled
            value={reqId}
          />
        </div>
      </div>

      {
        bridgeFee !== '0' && forceChains.map(c => c.id).includes(chain?.id) &&
        <div className='text-white text-sm'>Bridge Fee: {bridgeFee} {chain?.currency}</div>
      }

      <ConnectButton color='purple' forceChains={forceChains}>
        <ApprovalGuard
          tokenAddr={token?.addr}
          input={amount}
          balance={balance?.value}
          decimals={balance?.decimals}
          spender={contractAddr}
          coreCheck={coreCheck}
          pending={pending}
          disabled={belowAmount}
          onClick={async () => {
            if (proposer && reqId) {
              await postRequest(tunnel.id, proposer, reqId, recipient || proposer)
              const hash = await call()
              if (hash) {
                storeRequestAdd(tunnel.id, proposer, reqId, recipient || proposer, hash)
                await postRequest(tunnel.id, proposer, reqId, recipient || proposer, hash)
              }
            }
          }}
        >
          Propose {fromActionName} on <TokenIcon token={chain?.icon} className='mx-2' /> {chain?.name}
        </ApprovalGuard>
      </ConnectButton>
    </>
  )
}
