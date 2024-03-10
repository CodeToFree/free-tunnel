import React from 'react'
import { Spinner } from 'flowbite-react'
import { ethers } from 'ethers'
import { useChain, useERC20Allowance, useERC20Call } from '@/lib/hooks'

export default function ApprovalGuard ({ token, spender, required = 0, onClick, pending, Wrapper = ({ children }) => children, children }) {
  const chain = useChain()
  const tokenAddr = chain?.tokens[token]
  const { approved, refresh } = useERC20Allowance(tokenAddr, spender)

  const _required = ethers.BigNumber.from(required || 0).toString()
  const args = React.useMemo(() => [spender, _required], [spender, _required])
  const { call, pending: approvePending } = useERC20Call(tokenAddr, 'approve', args)
  const onApprove = React.useCallback(async () => {
    const success = await call()
    if (success) {
      refresh()
    }
  }, [call, refresh])

  if (!tokenAddr) {
    return <Wrapper onClick={onClick}>{children}</Wrapper>
  } else if (!approved) {
    return <Wrapper disabled><Spinner size='sm' className='mr-2' />Loading...</Wrapper>
  } else if (approved.lt(_required)) {
    if (approvePending) {
      return <Wrapper disabled><Spinner size='sm' className='mr-2' />Approving...</Wrapper>
    } else {
      return <Wrapper onClick={onApprove}>Approve</Wrapper>
    }
  }
  return (
    <Wrapper onClick={onClick} disabled={pending}>
      {pending && <Spinner size='sm' className='mr-2' />}
      {children}
    </Wrapper>
  )
}