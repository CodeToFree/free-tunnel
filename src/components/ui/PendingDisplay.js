import React from 'react'
import { Spinner } from 'flowbite-react'

export default function PendingDisplay({ className, pending, children, placeholder = '(N/A)' }) {
  if (pending) {
    return <Spinner size='sm' className='' />
  } else if (!children) {
    return <span className='text-gray-500'>{placeholder}</span>
  }
  return <span className={className}>{children}</span>
}
