import React from 'react'
import { Card, Badge } from 'flowbite-react'

import { TokenIcon } from '@/components/ui'

import { ROLES, PROPOSE_PERIOD, EXECUTE_PERIOD } from '@/lib/const'

import { capitalize } from './lib'
import ButtonPropose from './ButtonPropose'
import ButtonExecute from './ButtonExecute'
import ButtonCancel from './ButtonCancel'

const defaultTokens = {
  1: 'USDC',
  2: 'USDT',
  64: 'BTC',
  65: 'ETH',
  66: 'MERL',
  67: 'STONE',
  68: 'FDUSD',
  69: 'BDGM',
  71: 'POL',
  72: 'SolvBTC.m',
  73: 'SolvBTC.b',
  75: 'BBTC',
  76: 'BBUSD',
  77: 'uBTC',
  78: 'SolvBTC',
  79: 'SolvBTC.BBN',
  80: 'SolvBTC.ENA',
  83: 'iBTC',
  192: 'WBTC',
  193: 'pumpBTC',
  194: 'uniBTC',
  195: 'cbBTC',
}

export default function RequestItem ({ tokens, role, action, exes, ...req }) {
  const fromActionName = capitalize(action.split('-')[0])
  const toActionName = capitalize(action.split('-')[1])
  const { id, proposer, value, tokenIndex, created, fromChain, toChain, vault, recipient, hash } = req

  const chain1 = action === 'burn-unlock' ? toChain : fromChain
  const chain2 = action === 'burn-unlock' ? fromChain : toChain

  const token = tokens?.find(t => t.index === tokenIndex)
  const tokenSymbol = fromChain.tokens[token?.addr] || toChain.tokens[token?.addr] || defaultTokens[tokenIndex]

  return (
    <Card className='mt-2 overflow-hidden'>
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
              href={`${chain1.explorerUrl}/address/${proposer}`}
              target='_blank'
            >{proposer}</a>
          </div>
        }

        <div className='mt-1 flex items-center'>
          <TokenIcon size='sm' token={chain1?.icon} className='mr-1.5' />
          <div className='text-white whitespace-nowrap mr-2'>{vault && 'Vault '}{fromActionName}:</div>
          {
            hash?.p1
            ? <Badge className='cursor-pointer hover:opacity-80' onClick={() => window.open(`${chain1.explorerUrl}/tx/${hash.p1.replace('^', '')}`, '_blank')}>
                {hash.p1.startsWith('^') && '🟢 '}Proposed
              </Badge>
            : <Badge color='gray'>Not Proposed</Badge>
          }
          {
            hash?.p1 && hash?.p2 && !hash?.c1 &&
            <>
              <div className='text-gray-400 mx-2 whitespace-nowrap'>{'->'}</div>
              {
                hash.e1
                ? <Badge color='green' className='cursor-pointer hover:opacity-80' onClick={() => window.open(`${chain1.explorerUrl}/tx/${hash.e1.replace('^', '')}`, '_blank')}>
                    {hash.e1.startsWith('^') && '🟢 '}Executed
                  </Badge>
                : <Badge color='gray'>Execute {new Date((created + EXECUTE_PERIOD) * 1000).toLocaleString()}</Badge>
              }
            </>
          }
          {
            hash?.p1 && hash?.c1 &&
            <>
              <div className='text-gray-400 mx-2 whitespace-nowrap'>{'->'}</div>
              <Badge color='gray' className='cursor-pointer hover:opacity-80' onClick={() => window.open(`${chain1.explorerUrl}/tx/${hash.c1.replace('^', '')}`, '_blank')}>
                {hash.c1.startsWith('^') && '🟢 '}Cancelled
              </Badge>
            </>
          }
        </div>
        <div className='mt-1 flex items-center'>
          <TokenIcon size='sm' token={chain2?.icon} className='mr-1.5' />
          <div className='text-white whitespace-nowrap mr-2'>{vault && 'Vault '}{toActionName}:</div>
          {
            hash?.p2
            ? <>
                <Badge className='cursor-pointer hover:opacity-80' onClick={() => window.open(`${chain2.explorerUrl}/tx/${hash.p2.replace('^', '')}`, '_blank')}>
                  {hash.p2.startsWith('^') && '🟢 '}Proposed
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
            ? <Badge color='green' className='cursor-pointer hover:opacity-80' onClick={() => window.open(`${chain2.explorerUrl}/tx/${hash.e2.replace('^', '')}`, '_blank')}>
                {hash.e2.startsWith('^') && '🟢 '}Executed
              </Badge>
            : hash?.c2
              ? <Badge color='gray' className='cursor-pointer hover:opacity-80' onClick={() => window.open(`${chain2.explorerUrl}/tx/${hash.c2.replace('^', '')}`, '_blank')}>
                  {hash.c2.startsWith('^') && '🟢 '}Cancelled
                </Badge>
              : hash?.p2 && <Badge color='gray'>Execute {new Date((created + EXECUTE_PERIOD) * 1000).toLocaleString()}</Badge>
          }
        </div>
        <RequestActionButton role={role} action={action} exes={exes} {...req} />
      </div>
    </Card>
  )
}

function RequestActionButton ({ role, action, exes, ...req }) {
  if ((req.hash?.e1 && req.hash?.e2) || req.hash?.c2 || (req.hash?.c1 && !req.hash?.p2)) {
    return
  }
  if (Date.now() / 1000 > req.created + EXECUTE_PERIOD && !req.tunnelId) {
    return <div className='mt-2'><ButtonCancel action={action} {...req} /></div>
  } else if (req.hash?.p2) {
    return <div className='mt-2'><ButtonExecute role={role} action={action} exes={exes} {...req} /></div>
  } else if (role === ROLES.Proposer && !req.tunnelId) {
    return <div className='mt-2'><ButtonPropose action={action} {...req} /></div>
  }
}
