import React from 'react'

import { CHAINS } from '@/lib/const'
import Toasts, { useToast } from './Toasts'
import useTronLink from './useTronLink'

const AppContext = React.createContext()

export const useAppHooks = () => React.useContext(AppContext)

export const useFreeChannel = chain => {
  const { channel } = React.useContext(AppContext)
  const chainId = chain?.id
  return React.useMemo(() => {
    const from = channel.from.map(id => CHAINS.find(c => c.id === id))
    const to = channel.to.map(id => CHAINS.find(c => c.id === id))
    const contractAddr = channel?.contracts[chainId]
    return { channel: { ...channel, from, to }, contractAddr }
  }, [channel, chainId])
}

export function AppProvider ({ channel, children }) {
  const { toasts, addToast, removeToast } = useToast()
  const tronlink = useTronLink(addToast)

  const value = React.useMemo(() => ({
    channel, addToast, removeToast, tronlink
  }), [channel, addToast, removeToast, tronlink])

  return (
    <AppContext.Provider value={value}>
      {children}
      <Toasts toasts={toasts} />
    </AppContext.Provider>
  )
}
