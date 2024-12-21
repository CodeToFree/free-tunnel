import React from 'react'
import classnames from 'classnames'
import { Header as _Header } from '@/components/ui'

export default function AppContainer({ Header = _Header, fullscrenn, children, left }) {
  return (
    <div className={classnames('flex flex-col', fullscrenn ? 'h-full overflow-hidden' : 'min-h-full')}>
      <Header />
      <main className='w-full flex-1 flex flex-row items-start justify-center app-background px-4'>
        <div className='flex flex-col lg:flex-row max-w-full gap-4 sm:gap-6 z-10 py-4 sm:py-10 pb-10 overflow-x-auto'>
          {children}
        </div>
      </main>
    </div>
  )
}
