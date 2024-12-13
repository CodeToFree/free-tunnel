import React from 'react'
import { Accordion, Button } from 'flowbite-react'
import { HiChevronDoubleDown } from 'react-icons/hi'

import { CHAINS, ADDR_ZERO } from '@/lib/const'
import { useContractQuery } from '@/lib/hooks'
import { getTunnelContract } from '@/lib/request'
import TunnelContract from '@/lib/abis/TunnelContract.json'

import { TokenIcon } from '@/components/ui'

export default function TunnelList ({ tunnels = [], className, action = 'Launch' }) {
  const [opened, setOpened] = React.useState()
  const openAccordion = id => setOpened(prev => prev === id ? null : id)

  return (
    <Accordion collapseAll className={className}>
    {
      tunnels.map(item => (
        <Accordion.Panel key={item.id}>
          <div onClick={() => openAccordion(item.id)}>
            <Accordion.Title className='p-3'>
              <div className='flex items-center'>
                <img src={item.logo} className='w-6 h-6 mr-3' />
                {item.name}
              </div>
            </Accordion.Title>
          </div>
          <Accordion.Content className='p-3'>
            {opened === item.id && <TunnelDetail tunnel={item} />}
            <Button className='mt-4' size='sm' onClick={() => window.location.href = `/${item.id}`}>{action}</Button>
          </Accordion.Content>
        </Accordion.Panel>
      ))
    }
    </Accordion>
  )
}

export function TunnelDetail ({ tunnel }) {
  return (
    <div className='grid gap-y-3'>
    {
      tunnel.from.map(id => {
        const chain = CHAINS.find(c => c.id === id)
        return <ChainDetail key={chain.id} chain={chain} contractAddr={getTunnelContract(tunnel, id)?.addr} />
      })
    }
    {
      tunnel.from.length > 0 &&
      <div className='mx-auto' >
        <HiChevronDoubleDown />
      </div>
    }
    {
      tunnel.to.map(id => {
        const chain = CHAINS.find(c => c.id === id)
        return <ChainDetail key={chain.id} chain={chain} contractAddr={getTunnelContract(tunnel, id)?.addr} />
      })
    }
    </div>
  )
}

function ChainDetail ({ chain, contractAddr }) {
  const { result: version } = useContractQuery(contractAddr, TunnelContract, 'VERSION', null, chain)
  const { result: vault } = useContractQuery(contractAddr, TunnelContract, 'getVault', null, chain)
  const { result: _tokens } = useContractQuery(contractAddr, TunnelContract, 'getSupportedTokens', null, chain)
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
      {version && <div className='flex justify-end text-[10px] text-gray-500'>v2.{version.toString()}</div>}
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
            href={`${chain.explorerUrl}/${['zksync', 'zklink', 'zircuit', 'duck', 'morph', 'hemi', 'taker'].includes(chain.id) ? 'address' : 'token'}/${t.addr}`}
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
