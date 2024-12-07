import React from 'react'

import { CHAINS } from '@/lib/const'
import { getTunnelContract } from '@/lib/request'
import Toasts, { useToast } from './Toasts'
import useTronLink from './useTronLink'

const AppContext = React.createContext()

export const useAppHooks = () => React.useContext(AppContext)

export const useFreeTunnel = chain => {
  const { tunnel } = React.useContext(AppContext)
  const chainId = chain?.id
  return React.useMemo(() => {
    const from = tunnel.from.map(id => CHAINS.find(c => c.id === id))
    const to = tunnel.to.map(id => CHAINS.find(c => c.id === id))

    const contract = getTunnelContract(tunnel, chainId)
    return { tunnel: { ...tunnel, from, to }, contractAddr: contract?.addr }
  }, [tunnel, chainId])
}

export function AppProvider ({ tunnel, children }) {
  const { toasts, addToast, removeToast } = useToast()
  const tronlink = useTronLink(addToast)

  const value = React.useMemo(() => ({
    tunnel, addToast, removeToast, tronlink
  }), [tunnel, addToast, removeToast, tronlink])

  return (
    <AppContext.Provider value={value}>
      {children}
      <Toasts toasts={toasts} />
    </AppContext.Provider>
  )
}
