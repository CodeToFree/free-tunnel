import React from 'react'
import { Spinner } from 'flowbite-react'
import { useContractCall } from '@/lib/hooks'

export default function ContractCallButton ({ address, abi, method, args, callback, disabled, Wrapper = ({ children }) => children, children }) {
  const { pending, call } = useContractCall(address, abi, method, args)

  const onClick = React.useCallback(async () => {
    const hash = await call()
    if (hash && callback) {
      callback(hash)
    }
  }, [call, callback])

  return (
    <Wrapper onClick={onClick} disabled={disabled || pending}>
      {pending && <Spinner size='sm' className='mr-2' />}
      {children}
    </Wrapper>
  )
}
