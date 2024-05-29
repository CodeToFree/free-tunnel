import React from 'react'
import { Accordion, Button } from 'flowbite-react'

import { CHAINS } from '@/lib/const'
import { useContractQuery } from '@/lib/hooks'
import AtomicMint from '@/lib/abis/AtomicMint.json'

import { TokenIcon } from '@/components/ui'
import { TokenSelector } from '@/components/web3'

export default function ChannelList ({ channels = [], className, action = 'Launch' }) {
  return (
    <Accordion collapseAll className={className}>
    {
      channels.map(item => (
        <Accordion.Panel key={item.id}>
          <Accordion.Title className='p-3'>
            <div className='flex items-center'>
              <img src={item.logo} className='w-6 h-6 mr-3' />
              {item.name}
            </div>
          </Accordion.Title>
          <Accordion.Content className='p-3'>
            <ChannelDetail channel={item} />
            <Button className='mt-4' size='sm' onClick={() => window.location.href = `/${item.id}`}>{action}</Button>
          </Accordion.Content>
        </Accordion.Panel>
      ))
    }
    </Accordion>
  )
}

export function ChannelDetail ({ channel }) {
  return (
    <div className='grid gap-y-3'>
    {
      channel.from.map(id => {
        const chain = CHAINS.find(c => c.id === id)
        return <ChainDetail key={chain.id} chain={chain} contractAddr={channel.contracts[chain.id]} />
      })
    }
    {
      channel.to.map(id => {
        const chain = CHAINS.find(c => c.id === id)
        return <ChainDetail key={chain.id} chain={chain} contractAddr={channel.contracts[chain.id]} />
      })
    }
    </div>
  )
}

export function ChainDetail ({ chain, contractAddr }) {
  const { result: _tokens } = useContractQuery(contractAddr, AtomicMint, 'getSupportedTokens', null, chain)
  const tokens = React.useMemo(() => {
    if (!_tokens) {
      return []
    }
    const { supportedTokens, indexes } = _tokens
    return supportedTokens.map((addr, i) => ({ addr, index: indexes[i] }))
  }, [_tokens])

  return (
    <div>
      <div className='flex items-end justify-between'>
        <div className='flex items-center text-lg'>
          <TokenIcon token={chain.icon} className='mr-3' />
          {chain.name}
        </div>
        <a className='text-sm text-gray-500 hover:underline hover:text-cyan-600' href={`${chain.explorerUrl}/address/${contractAddr}`} target='_blank'>
          {contractAddr}
        </a>
      </div>
      <div className='mt-0.5 ml-9 flex items-center gap-3'>
      {
        tokens?.map(t => (
          <a
            key={t.addr}
            className='flex items-center text-sm cursor-pointer hover:underline hover:text-cyan-600'
            href={`${chain.explorerUrl}/token/${t.addr}`}
            target='_blank'
          >
            <TokenIcon size='sm' className='mr-1' token={t.icon || chain?.tokens[t.addr]?.toLowerCase()} />
            {t.name || chain?.tokens[t.addr]}
          </a>
        ))
      }
      </div>
    </div>
  )
}
