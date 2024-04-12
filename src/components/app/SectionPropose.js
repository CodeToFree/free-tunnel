import React from 'react'
import { Label, TextInput, Checkbox } from 'flowbite-react'

import { TokenIcon } from '@/components/ui'
import {
  ConnectButton,
  TokenSelector,
  TokenBalance,
  MaxButton,
  ApprovalGuard,
} from '@/components/web3'

import { CHAINS_FROM, CHAINS_TO, VAULT_LIMIT } from '@/lib/const'
import { useChain, useAddress, useContractCall } from '@/lib/hooks'
import { newRequestId } from '@/lib/request'
import { getRequests, postRequest } from '@/lib/api'
import AtomicLock from '@/lib/abis/AtomicLock.json'
import AtomicMint from '@/lib/abis/AtomicMint.json'
import { useRequestsMethods } from '@/stores'

import { capitalize } from './lib'

export default function SectionPropose ({ action = 'lock-mint', token }) {
  const chain = useChain()
  const fromActionName = capitalize(action.split('-')[0])
  const toActionName = capitalize(action.split('-')[1])

  const proposer = useAddress()
  const [amount, setAmount] = React.useState('')
  const [balance, setBalance] = React.useState()
  const [vault, setVault] = React.useState(false)
  const [recipient, setRecipient] = React.useState('')

  const targets = action === 'lock-mint' ? CHAINS_TO : CHAINS_FROM
  const [target, setTarget] = React.useState(targets[0])

  React.useEffect(() => {
    setAmount('')
    setVault(false)
  }, [token])
  React.useEffect(() => {
    if (VAULT_LIMIT && Number(amount) >= VAULT_LIMIT) {
      setVault(true)
    }
  }, [amount])

  const from = action === 'lock-mint' ? chain?.atomicId : target?.atomicId // TODO to other from
  const to = action === 'lock-mint' ? target?.atomicId : chain?.atomicId
  const reqId = React.useMemo(
    () => newRequestId(action, amount, token?.index, from, to, vault),
    [action, amount, token?.index, from, to, vault]
  )
  const { addRequest, updateProposerRequests } = useRequestsMethods()

  React.useEffect(() => {
    if (proposer) {
      getRequests(proposer).then(reqs => updateProposerRequests(proposer, reqs))
    }
  }, [proposer, updateProposerRequests])

  const contract = chain?.AtomicContract
  const abi = action === 'lock-mint' ? AtomicLock : AtomicMint
  const method = action === 'lock-mint' ? 'proposeLock' : 'proposeBurn'
  const { pending, call } = useContractCall(contract, abi, method, [reqId.padEnd(66, '0')])

  const forceChains = action === 'lock-mint' ? CHAINS_FROM : CHAINS_TO

  if (!proposer) {
    return <ConnectButton color='purple' forceChains={forceChains} />
  }

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
      </div>

      {
        VAULT_LIMIT > 0 &&
        <div>
          <div className='mb-2 flex'>
            <Label value='Vault' />
          </div>
          <div className='flex items-center gap-2 text-white'>
            <Checkbox checked={vault} onChange={evt => setVault(evt.target.checked)} disabled={Number(amount) >= VAULT_LIMIT} />
            <div>
              {action === 'lock-mint' ? 'Lock fund to vault ' : 'Unlock from vault'}{Number(amount) >= VAULT_LIMIT && '(required for large amount)'}
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

      <ConnectButton color='purple' forceChains={forceChains}>
        <ApprovalGuard
          tokenAddr={token?.addr}
          input={amount}
          balance={balance?.value}
          decimals={balance?.decimals}
          spender={contract}
          pending={pending}
          onClick={async () => {
            if (proposer && reqId) {
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
