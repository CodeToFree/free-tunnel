import React from 'react'
import { Label, TextInput, Checkbox } from 'flowbite-react'
import { ethers } from 'ethers'

import { TokenIcon } from '@/components/ui'
import {
  ConnectButton,
  TokenSelector,
  TokenBalance,
  MaxButton,
  ApprovalGuard,
} from '@/components/web3'

import { CHAINS_FROM, CHAINS_TO, VAULT_LIMIT, BRIDGE_FEE, MIN_AMOUNTS, ADDR_ONE, TOKEN_PATHS } from '@/lib/const'
import { useChain, useAddress, useContractCall } from '@/lib/hooks'
import { newRequestId, parseRequest } from '@/lib/request'
import { getAllRequests, getRequests, postRequest } from '@/lib/api'
import AtomicLock from '@/lib/abis/AtomicLock.json'
import AtomicMint from '@/lib/abis/AtomicMint.json'
import { useRequestsMethods } from '@/stores'

import { capitalize } from './lib'

export default function SectionPropose ({ action = 'lock-mint', role, token }) {
  const chain = useChain()
  const fromActionName = capitalize(action.split('-')[0])
  const toActionName = capitalize(action.split('-')[1])

  const proposer = useAddress()
  const [amount, setAmount] = React.useState('')
  const [balance, setBalance] = React.useState()
  const [vault, setVault] = React.useState(false)
  const [recipient, setRecipient] = React.useState('')

  const targets = React.useMemo(() => {
    return (action === 'lock-mint' ? CHAINS_TO : CHAINS_FROM).filter(c => {
      if (!TOKEN_PATHS[token?.index]) {
        return true
      } else {
        return TOKEN_PATHS[token?.index].includes(c.atomicId)
      }
    })
  }, [action, token?.index])
  
  const [target, setTarget] = React.useState(targets[0])

  React.useEffect(() => {
    setAmount('')
    setVault(false)
  }, [token])

  const vaultLimit = VAULT_LIMIT[token?.index] || 0
  React.useEffect(() => {
    if (vaultLimit && Number(amount) >= vaultLimit) {
      setVault(true)
    }
  }, [amount, vaultLimit])

  const from = action === 'lock-mint' ? chain?.atomicId : target?.atomicId // TODO to other from
  const to = action === 'lock-mint' ? target?.atomicId : chain?.atomicId
  const reqId = React.useMemo(
    () => newRequestId(action, amount, token?.index, from, to, vault),
    [action, amount, token?.index, from, to, vault]
  )
  const { addRequest, updateProposerRequests, updateAllRequests } = useRequestsMethods()
  React.useEffect(() => {
    if (proposer) {
      if (role) {
        getAllRequests().then(reqs => updateAllRequests(reqs))
      } else {
        getRequests(proposer).then(reqs => updateProposerRequests(proposer, reqs))
      }
    }
  }, [proposer, role, updateProposerRequests, updateAllRequests])

  const contract = chain?.AtomicContract
  const abi = action === 'lock-mint' ? AtomicLock : AtomicMint
  const method = action === 'lock-mint' ? 'proposeLock' : 'proposeBurn'

  const bridgeFee = BRIDGE_FEE[target?.atomicId] || '0'
  const value = reqId && token?.addr === ADDR_ONE
    ? ethers.utils.parseEther(parseRequest(reqId).value)
    : ethers.utils.parseEther(method === 'proposeBurn' ? bridgeFee : '0')
  const { pending, call } = useContractCall(contract, abi, method, [reqId.padEnd(66, '0'), { value }])

  const forceChains = action === 'lock-mint' ? CHAINS_FROM : CHAINS_TO

  if (!proposer) {
    return <ConnectButton color='purple' forceChains={forceChains} />
  }

  const min = MIN_AMOUNTS[token?.index] || 0
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
      </div>

      {
        vaultLimit > 0 &&
        <div>
          <div className='mb-2 flex'>
            <Label value='Vault' />
          </div>
          <div className='flex items-center gap-2 text-white'>
            <Checkbox checked={vault} onChange={evt => setVault(evt.target.checked)} disabled={Number(amount) >= vaultLimit} />
            <div>
              {action === 'lock-mint' ? 'Lock fund to vault ' : 'Unlock from vault'}{Number(amount) >= vaultLimit && '(required for large amount)'}
            </div>
          </div>
        </div>
      }

      <div>
        <div className='mb-2 flex'>
          <Label value={`Receive ${toActionName} on`} />
        </div>
        <TokenSelector tokens={targets.map(t => ({ ...t, addr: t.atomicId }))} onChange={setTarget} />
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
        bridgeFee !== '0' &&
        <div className='text-white text-sm'>Bridge Fee: {bridgeFee} {chain?.currency}</div>
      }

      <ConnectButton color='purple' forceChains={forceChains}>
        <ApprovalGuard
          tokenAddr={token?.addr}
          input={amount}
          balance={balance?.value}
          decimals={balance?.decimals}
          spender={contract}
          pending={pending}
          disabled={belowAmount}
          onClick={async () => {
            if (proposer && reqId) {
              await postRequest(proposer, reqId, recipient || proposer)
              const hash = await call()
              if (hash) {
                addRequest(proposer, reqId, recipient || proposer, hash)
                await postRequest(proposer, reqId, recipient || proposer, hash)
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
