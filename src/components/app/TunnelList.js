import React from 'react'
import classnames from 'classnames'
import { ListGroup, Button, Badge, Tooltip } from 'flowbite-react'
import { HiChevronDoubleDown } from 'react-icons/hi'

import { CHAINS, ADDR_ZERO } from '@/lib/const'
import { useContractQuery } from '@/lib/hooks'
import { getTunnelContract } from '@/lib/request'
import TunnelContract from '@/lib/abis/TunnelContract.json'

import { TokenIcon } from '@/components/ui'

export default function TunnelList ({ tunnels = [], badges, current, action = 'Launch', SidePanel, className }) {
  const [selected, setSelected] = React.useState(null)

  React.useEffect(() => {
    const match = tunnels.find(t => t.id === current)
    setSelected(match || tunnels[0])
  }, [tunnels, current])

  const tunnelPageUrl = React.useMemo(() => {
    if (!selected) {
      return
    }
    if (
      selected.from.filter(id => ['aptos', 'movement', 'sui', 'rooch'].includes(id)).length ||
      selected.to.filter(id => ['aptos', 'movement', 'sui', 'rooch'].includes(id)).length
    ) {
      return `https://nonevm.free.tech/${selected.id}`
    }
    return `/${selected.id}`
  }, [selected])

  if (!selected) {
    return (
      <div className={classnames('flex flex-row min-w-[480px] min-h-80 overflow-hidden', className)}>
        <div className='w-full h-full flex items-center justify-center text-gray-400'>Loading...</div>
      </div>
    )
  }

  return (
    <div className={classnames('relative flex flex-row min-w-[480px] min-h-80 overflow-hidden', className)}>
      <ListGroup className='h-full w-[280px] min-w-[160px] py-4 bg-gray-800 overflow-auto'>
      {
        tunnels.map(item => (
          <ListGroup.Item key={item.id} active={item === selected} onClick={() => setSelected(item)}>
            <div className='w-full flex items-center justify-between'>
              <div className='flex items-center overflow-hidden'>
                <img src={item.logo} className='w-6 h-6 mr-2' />
                <div className='overflow-hidden text-nowrap text-ellipsis'>{item.name}</div>
              </div>
              {
                item.id === current &&
                <div>✅</div>
              }
              {
                badges?.[item.id] &&
                <div className='ml-2 h-5 px-1.5 py-0.5 bg-yellow-200 text-yellow-800 rounded-md text-sm leading-none'>{badges[item.id]}</div>
              }
            </div>
          </ListGroup.Item>
        ))
      }
      </ListGroup>
      <div className='flex-1 w-[320px] md:min-w-[580px] flex flex-col md:flex-row text-white'>
        <div className='flex-1 flex flex-col h-0 md:h-auto md:w-0 overflow-hidden'>
          <div className='flex items-center justify-between my-3.5 px-4'>
            <div className='overflow-hidden text-nowrap text-ellipsis text-gray-500 mr-3'>
              <h3 className='inline-block text-xl text-white font-semibold'>{selected.name}</h3>
              <span className='ml-1 text-sm'>({selected.from.length ? 'Lock-Mint' : 'Burn-Mint'})</span>
            </div>
            <Button size='sm' href={tunnelPageUrl}>{action}</Button>
          </div>
          <div className='flex-1 px-4 pb-4 overflow-y-auto'>
            <TunnelDetail tunnel={selected} singleCol={!!SidePanel} />
          </div>
        </div>
        {
          SidePanel &&
          <div className='flex-1 h-0 md:h-auto md:w-0 border-t md:border-l border-gray-500 overflow-hidden'>
            <SidePanel tunnels={tunnels} tunnelId={selected?.id} />
          </div>
        }
      </div>
    </div>
  )
}

export function TunnelDetail ({ tunnel, singleCol }) {
  return (
    <>
      <div className={classnames('grid grid-cols-1 gap-x-4 gap-y-3', !singleCol && 'lg:grid-cols-2')}>
      {
        tunnel.from.map(id => {
          const chain = CHAINS.find(c => c.id === id)
          return <ChainDetail key={chain?.id} chain={chain} contractAddr={getTunnelContract(tunnel, id)?.addr} />
        })
      }
      </div>
      {
        tunnel.from.length > 0 &&
        <div className={classnames('my-4 w-full flex justify-center', !singleCol && 'lg:w-1/2 ')}>
          <HiChevronDoubleDown />
        </div>
      }
      <div className={classnames('grid grid-cols-1 gap-x-4 gap-y-3', !singleCol && 'lg:grid-cols-2')}>
      {
        tunnel.to.map(id => {
          const chain = CHAINS.find(c => c.id === id)
          return <ChainDetail key={chain?.id} chain={chain} contractAddr={getTunnelContract(tunnel, id)?.addr} />
        })
      }
      </div>
    </>
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

  if (!chain) {
    return
  }

  return (
    <div className='rounded-xl overflow-hidden'>
      <div className='bg-gray-800 p-3 pb-2'>
        <div className='flex items-end justify-between'>
          <div className='flex items-center text-nowrap shrink-0'>
            <TokenIcon chain={chain} className='mr-2' />
            <h4 className='font-semibold'>{chain.name}</h4>
          </div>
          {
            vault && vault !== ADDR_ZERO &&
            <Tooltip content={
              <a
                className='text-sm cursor-pointer hover:underline hover:text-cyan-600'
                href={`${chain.explorerUrl}/address/${vault}`}
                target='_blank'
              >{vault}</a>
            }>
              <div className='ml-4 flex justify-center items-center h-5 w-6 px-1 bg-gray-700 rounded text-xs text-white cursor-pointer'>
                🗳️
              </div>
            </Tooltip>
          }
        </div>
        <div className='mt-2 flex items-center justify-between'>
          <a
            className='overflow-hidden text-ellipsis text-sm text-gray-500 hover:underline hover:text-cyan-600'
            href={`${chain.explorerUrl}/address/${contractAddr}`}
            target='_blank'
          >
            {contractAddr}
          </a>
          {
            version &&
            <Tooltip content={version.toString()}>
              <div className='ml-4 flex justify-center items-center h-4 w-5 bg-yellow-400 rounded text-xs text-white font-bold cursor-pointer'>
                v2
              </div>
            </Tooltip>
          }
        </div>
      </div>
      <div className='bg-gray-700 px-3 py-2 min-h-9 flex items-center flex-wrap gap-x-4 gap-y-1'>
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
