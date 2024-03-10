import React from 'react'
import { ethers } from 'ethers'
import { Spinner } from 'flowbite-react'
import { useChain, useCoreBalance, useERC20Balance } from '@/lib/hooks'

export default function TokenBalance ({ className, token, refreshTrigger }) {
  const chain = useChain()
  if (!chain) {
    return
  } else if (chain.currency === token) {
    return <CoreBalance className={className} refreshTrigger={refreshTrigger} />
  } else {
    return <ERC20Balance className={className} token={token} refreshTrigger={refreshTrigger} />
  }
}

export function CoreBalance ({ className, refreshTrigger }) {
  const chain = useChain()
  const { symbol, balance, decimals, refresh } = useCoreBalance()

  React.useEffect(() => {
    if (refreshTrigger) {
      refresh()
    }
  }, [refreshTrigger, refresh])

  if (!chain) {
    return
  } else if (!balance) {
    return <Spinner size='sm' className='' />
  }

  return (
    <span className={className}>
      {ethers.utils.formatUnits(balance, decimals)} {symbol}
    </span>
  )
}

export function ERC20Balance ({ className, token, refreshTrigger }) {
  const chain = useChain()
  const tokenAddr = chain?.tokens[token]
  const { balance, decimals, refresh } = useERC20Balance(tokenAddr)

  React.useEffect(() => {
    if (refreshTrigger) {
      refresh()
    }
  }, [refreshTrigger, refresh])

  if (!chain) {
    return
  } else if (!balance) {
    return <Spinner size='sm' className='' />
  }

  return (
    <span className={className}>
      {ethers.utils.formatUnits(balance, decimals)} {token}
    </span>
  )
}
