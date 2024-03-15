import React from 'react'
import { Header } from '@/components/ui'

export default function AppContainer({ children, left }) {
  return (
    <div className='flex flex-col min-h-full'>
      <Header />
      <main className='w-full flex-1 flex flex-col md:flex-row items-center md:items-start justify-center app-background'>
        <div className='z-10 shrink-[4] w-[520px] max-w-full py-10 sm:py-20 pl-8 lg:pl-16'>
          {left}
        </div>
        <div className='z-10 shrink-1 w-[520px] max-w-full pb-10 sm:pb-20 md:py-20 px-6'>
          {children}
        </div>
        <div className='z-10 shrink-[8] w-0 xl:w-[520px] transition-[width]'>
        </div>
      </main>
    </div>
  )
}
