import React from 'react'
import { Header } from '@/components/ui'

export default function AppContainer({ noHeader, children, left }) {
  return (
    <div className='flex flex-col min-h-full'>
      {!noHeader && <Header />}
      <main className='w-full flex-1 flex flex-row items-start justify-center app-background px-4'>
        <div className='flex flex-col lg:flex-row max-w-full gap-4 sm:gap-6 z-10 py-4 sm:py-10 pb-10'>
          {children}
        </div>
      </main>
    </div>
  )
}
