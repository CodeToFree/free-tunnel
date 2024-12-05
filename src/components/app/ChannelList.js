import React from 'react'
import { Accordion, Button } from 'flowbite-react'
import { HiChevronDoubleDown } from 'react-icons/hi'

import { CHAINS, ADDR_ZERO } from '@/lib/const'
import { useContractQuery } from '@/lib/hooks'
import AtomicMint from '@/lib/abis/AtomicMint.json'

import { TokenIcon } from '@/components/ui'

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
      channel.from.length > 0 &&
      <div className='mx-auto' >
        <HiChevronDoubleDown />
      </div>
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
  const { result: vault } = useContractQuery(contractAddr, AtomicMint, 'getVault', null, chain)
  const { result: _tokens } = useContractQuery(contractAddr, AtomicMint, 'getSupportedTokens', null, chain)
  const tokens = React.useMemo(() => {
    if (!_tokens) {
      return []
    }
    const { supportedTokens, indexes } = _tokens
    return supportedTokens.map((addr, i) => ({ addr, index: indexes[i] }))
  }, [_tokens])

  return (
    <div className='overflow-hidden'>
      <div className='flex items-end justify-between'>
        <div className='flex items-center text-lg text-nowrap shrink-0'>
          <TokenIcon token={chain.icon} className='mr-3' />
          {chain.name}
        </div>
        <a
          className='ml-2 mb-0.5 overflow-hidden text-ellipsis text-xs font-mono text-gray-500 hover:underline hover:text-cyan-600'
          href={`${chain.explorerUrl}/address/${contractAddr}`}
          target='_blank'
        >
          {contractAddr}
        </a>
      </div>
      {
        vault && vault !== ADDR_ZERO &&
        <div className='ml-9 flex items-center justify-between text-sm'>
          <div>Vault</div>
          <a
            className='text-xs font-mono text-gray-500 cursor-pointer hover:underline hover:text-cyan-600'
            href={`${chain.explorerUrl}/address/${vault}`}
            target='_blank'
          >{vault}</a>
        </div>
      }
      <div className='mt-1 ml-9 flex items-center flex-wrap gap-x-3 gap-y-1'>
      {
        tokens?.map(t => (
          <a
            key={t.addr}
            className='flex items-center text-sm cursor-pointer hover:underline hover:text-cyan-600'
            href={`${chain.explorerUrl}/${['zksync', 'zklink', 'duck', 'morph', 'hemi'].includes(chain.id) ? 'address' : 'token'}/${t.addr}`}
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
