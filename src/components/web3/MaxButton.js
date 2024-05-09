import React from 'react'
import { Button } from 'flowbite-react'
import { ethers } from 'ethers'

export default function MaxButton ({ className, balance, onMax = () => {} }) {
  const onClick = React.useCallback(() => {
    if (!balance) {
      onMax('')
    } else {
      onMax(Number(ethers.utils.formatUnits(balance.value, balance.decimals)).toFixed(6))
    }
  }, [onMax, balance])

  return (
    <Button size='xs' color='light' className={className} onClick={onClick}>
      MAX
    </Button>
  )
}
