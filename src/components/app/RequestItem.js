import React from 'react'
import { Card, Badge } from 'flowbite-react'

import { TokenIcon } from '@/components/ui'

import { ROLES, PROPOSE_PERIOD, EXECUTE_PERIOD } from '@/lib/const'

import { capitalize } from './lib'
import ButtonPropose from './ButtonPropose'
import ButtonExecute from './ButtonExecute'

const defaultTokens = {
  1: 'USDC',
  2: 'USDT',
  64: 'BTC',
  65: 'ETH',
  66: 'MERL',
}

export default function RequestItem ({ tokens, role, action, exes, ...req }) {
  const fromActionName = capitalize(action.split('-')[0])
  const toActionName = capitalize(action.split('-')[1])
  const { id, proposer, value, tokenIndex, created, fromChain, toChain, vault, recipient, hash } = req

  const chain1 = action === 'lock-mint' ? fromChain : toChain
  const chain2 = action === 'lock-mint' ? toChain : fromChain

  const token = tokens?.find(t => t.index === tokenIndex)
  const tokenSymbol = fromChain.tokens[token?.addr] || toChain.tokens[token?.addr] || defaultTokens[tokenIndex]

  return (
    <Card className='mt-2'>
      <div className='-m-2 flex flex-col'>
        <div className='flex justify-between text-gray-500'>
          <div className='text-xs'>{id}</div>
          <div className='text-xs'>{new Date(created * 1000).toLocaleString()}</div>
        </div>
        <div className='mt-1.5 mb-1 flex items-center text-sm whitespace-nowrap overflow-hidden'>
          <TokenIcon token={tokenSymbol?.toLowerCase()} className='shrink-0 mr-1.5' />
          <div className='flex items-end text-gray-400 overflow-hidden'>
            <div className='text-white text-xl'>{value}</div>
            <div className='mb-[2.5px] overflow-hidden text-ellipsis'>
              <span className='ml-1 text-white'>{tokenSymbol}</span>
              <span className='mx-1 whitespace-nowrap'>{`->`}</span>
              <a
                className='cursor-pointer hover:text-cyan-500 hover:underline'
                href={`${chain2.explorerUrl}/address/${recipient}`}
                target='_blank'
              >
                {recipient}
              </a>
            </div>
          </div>
        </div>
        {
          role === ROLES.Executor &&
          <div className='mt-1 text-gray-400 text-xs whitespace-nowrap overflow-hidden text-ellipsis'>
            <span className='text-white'>Proposer:{' '}</span>
            <a
              className='cursor-pointer hover:text-cyan-500 hover:underline'
              href={`${chain1.explorerUrl}/hash/${proposer}`}
              target='_blank'
            >{proposer}</a>
          </div>
        }

        <div className='mt-1 flex items-center'>
          <TokenIcon size='sm' token={chain1?.icon} className='mr-1.5' />
          <div className='text-white whitespace-nowrap mr-2'>{vault && 'Vault '}{fromActionName}:</div>
          {
            hash?.p1
            ? <Badge className='cursor-pointer hover:opacity-80' onClick={() => window.open(`${chain1.explorerUrl}/tx/${hash.p1}`, '_blank')}>
                Proposed
              </Badge>
            : <Badge color='gray'>Not Proposed</Badge>
          }
          {
            hash?.p1 && hash?.p2 &&
            <>
              <div className='text-gray-400 mx-2 whitespace-nowrap'>{'->'}</div>
              {
                hash.e1
                ? <Badge color='green' className='cursor-pointer hover:opacity-80' onClick={() => window.open(`${chain1.explorerUrl}/tx/${hash.e1}`, '_blank')}>
                    Executed
                  </Badge>
                : <Badge color='gray'>Execute before {new Date((created + EXECUTE_PERIOD) * 1000).toLocaleString()}</Badge>
              }
            </>
          }
        </div>
        <div className='mt-1 flex items-center'>
          <TokenIcon size='sm' token={chain2?.icon} className='mr-1.5' />
          <div className='text-white whitespace-nowrap mr-2'>{vault && 'Vault '}{toActionName}:</div>
          {
            hash?.p2
            ? <>
                <Badge className='cursor-pointer hover:opacity-80' onClick={() => window.open(`${chain2.explorerUrl}/tx/${hash.p2}`, '_blank')}>
                  Proposed
                </Badge>
                <div className='text-gray-400 mx-2 whitespace-nowrap'>{'->'}</div>
              </>
            : role === ROLES.Executor
              ? <Badge color='red'>Not Proposed</Badge>
              : Date.now() > (created + PROPOSE_PERIOD) * 1000
                ? <Badge color='red'>Expired at {new Date((created + PROPOSE_PERIOD) * 1000).toLocaleString()}</Badge>
                : <Badge color='warning'>Before {new Date((created + PROPOSE_PERIOD) * 1000).toLocaleString()}</Badge>
          }
          {
            hash?.e2
            ? <Badge color='green' className='cursor-pointer hover:opacity-80' onClick={() => window.open(`${chain2.explorerUrl}/tx/${hash.e2}`, '_blank')}>
                Executed
              </Badge>
            : hash?.p2 && <Badge color='gray'>Execute before {new Date((created + EXECUTE_PERIOD) * 1000).toLocaleString()}</Badge>
          }
        </div>
        <RequestActionButton role={role} action={action} exes={exes} {...req} />
      </div>
    </Card>
  )
}

function RequestActionButton ({ role, action, exes, ...req }) {
  if (req.hash?.e2) {
    return
  }
  if (req.hash?.p2) {
    return <div className='mt-2'><ButtonExecute role={role} action={action} exes={exes} {...req} /></div>
  } else if (role === ROLES.Proposer) {
    return <div className='mt-2'><ButtonPropose action={action} {...req} /></div>
  }
}
