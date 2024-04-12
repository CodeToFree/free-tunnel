import React from 'react'
import { Spinner } from 'flowbite-react'
import { toValue, useERC20Allowance, useERC20Call } from '@/lib/hooks'

export default function ApprovalGuard ({ tokenAddr, input, balance, decimals, spender, onClick, disabled, pending, Wrapper = ({ children }) => children, children }) {
  const { approved, refresh } = useERC20Allowance(tokenAddr, spender)

  const value = toValue(input, decimals)
  const overBalance = balance && toValue(balance, decimals).lt(value)

  const args = React.useMemo(() => [spender, value], [spender, value])
  const { call, pending: approvePending } = useERC20Call(tokenAddr, 'approve', args)
  const onApprove = React.useCallback(async () => {
    const success = await call()
    if (success) {
      refresh()
    }
  }, [call, refresh])

  if (!input) {
    return <Wrapper disabled>Enter Amount</Wrapper>
  } else if (isNaN(input)) {
    return <Wrapper disabled>Invalid Amount</Wrapper>
  } else if (value.eq(0)) {
    return <Wrapper disabled>Amount Cannot be Zero</Wrapper>
  } else if (value.eq(-1)) {
    return <Wrapper disabled>Decimals Overflow</Wrapper>
  } else if (overBalance) {
    return <Wrapper disabled>Amount Over Balance</Wrapper>
  }

  if (tokenAddr) {
    if (!approved) {
      return <Wrapper disabled><Spinner size='sm' className='mr-2' />Loading...</Wrapper>
    }
    if (approved.lt(value)) {
      if (approvePending) {
        return <Wrapper disabled><Spinner size='sm' className='mr-2' />Approving...</Wrapper>
      } else {
        return <Wrapper onClick={onApprove}>Approve</Wrapper>
      }
    }
  }

  return (
    <Wrapper onClick={onClick} disabled={disabled || pending}>
      {pending && <Spinner size='sm' className='mr-2' />}
      {children}
    </Wrapper>
  )
}
