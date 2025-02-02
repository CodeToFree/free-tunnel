import React from 'react'
import { Spinner } from 'flowbite-react'
import { ADDR_ONE } from '@/lib/const'
import { toValue, useCoreBalance, useERC20Allowance, useERC20Call } from '@/lib/hooks'

export default function ApprovalGuard ({ tokenAddr, input, balance, decimals, spender, coreCheck, onClick, disabled, pending, Wrapper = ({ children }) => children, children }) {
  const core = useCoreBalance()

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

  if (typeof disabled === 'string' && disabled) {
    return <Wrapper disabled>{disabled}</Wrapper>
  } else if (!input) {
    return <Wrapper disabled>Enter Amount</Wrapper>
  } else if (isNaN(input)) {
    return <Wrapper disabled>Invalid Amount</Wrapper>
  } else if (value.eq(0)) {
    return <Wrapper disabled>Amount Cannot be Zero</Wrapper>
  } else if (toValue(input, 6).eq(-1)) {
    return <Wrapper disabled>Max 6 Decimals</Wrapper>
  } else if (overBalance) {
    return <Wrapper disabled>Amount Over Balance</Wrapper>
  } else if (coreCheck && toValue(coreCheck.require, core.decimals).gt(core.balance || 0)) {
    return <Wrapper disabled>{coreCheck.alert}</Wrapper>
  }

  if (tokenAddr && tokenAddr !== ADDR_ONE) {
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
