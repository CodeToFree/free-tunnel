import React from 'react'
import { ethers } from 'ethers'
import { Spinner } from 'flowbite-react'
import { ADDR_ONE } from '@/lib/const'
import { useChain, useCoreBalance, useERC20Balance } from '@/lib/hooks'

export default function TokenBalance ({ className, address, tokenAddr, placeholder = '(N/A)', onUpdate, refreshTrigger }) {
  const chain = useChain()
  if (!chain) {
    return <span className='text-gray-500'>{placeholder}</span>
  } else if (ADDR_ONE === tokenAddr) {
    return <CoreBalance className={className} address={address} placeholder={placeholder} onUpdate={onUpdate} refreshTrigger={refreshTrigger} />
  } else {
    return <ERC20Balance className={className} address={address} tokenAddr={tokenAddr} placeholder={placeholder} onUpdate={onUpdate} refreshTrigger={refreshTrigger} />
  }
}

export function CoreBalance ({ className, address, placeholder, onUpdate = () => {}, refreshTrigger }) {
  const chain = useChain()
  const { symbol, balance, decimals, refresh } = useCoreBalance(address)

  React.useEffect(() => {
    if (refreshTrigger) {
      refresh()
    }
  }, [refresh, refreshTrigger])

  React.useEffect(() => {
    if (balance) {
      onUpdate({ value: balance, decimals })
    } else {
      onUpdate(null)
    }
  }, [balance, decimals, onUpdate])

  if (!chain) {
    return <span className='text-gray-500'>{placeholder}</span>
  } else if (!balance) {
    return <Spinner size='sm' className='' />
  }

  return (
    <span className={className}>
      {ethers.utils.formatUnits(balance, decimals)} {symbol}
    </span>
  )
}

export function ERC20Balance ({ className, address, tokenAddr, placeholder, onUpdate = () => {}, refreshTrigger }) {
  const chain = useChain()
  const { balance, decimals, refresh } = useERC20Balance(tokenAddr, address)

  React.useEffect(() => {
    if (refreshTrigger) {
      refresh()
    }
  }, [refresh, refreshTrigger])

  React.useEffect(() => {
    if (balance) {
      onUpdate({ value: balance, decimals })
    } else {
      onUpdate(null)
    }
  }, [balance, decimals, onUpdate])

  if (!chain || !tokenAddr) {
    return <span className='text-gray-500'>{placeholder}</span>
  } else if (!balance) {
    return <Spinner size='sm' className='' />
  }

  return (
    <span className={className}>
      {ethers.utils.formatUnits(balance, decimals)} {chain.tokens[tokenAddr]}
    </span>
  )
}
