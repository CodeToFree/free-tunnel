import React from 'react'

import { CHAINS } from '@/lib/const'
import { getTunnelContract } from '@/lib/request'
import Toasts, { useToast } from './Toasts'
import useNonEthersWallets from './useNonEthersWallets'

const AppContext = React.createContext()

export const useAppHooks = () => React.useContext(AppContext)

export const useFreeTunnel = chain => {
  const { tunnel } = React.useContext(AppContext)
  const chainId = chain?.id
  return React.useMemo(() => {
    const from = tunnel.from.map(id => CHAINS.find(c => c.id === id))
    const to = tunnel.to.map(id => CHAINS.find(c => c.id === id))

    const contract = getTunnelContract(tunnel, chainId)
    return { tunnel: { ...tunnel, from, to }, contractAddr: contract?.addr, v2: contract?.v2 }
  }, [tunnel, chainId])
}

export function AppProvider ({ tunnel, children }) {
  const { toasts, addToast, removeToast } = useToast()
  const wallets = useNonEthersWallets(addToast)

  const value = React.useMemo(() => ({
    tunnel, addToast, removeToast, wallets
  }), [tunnel, addToast, removeToast, wallets])

  return (
    <AppContext.Provider value={value}>
      {children}
      <Toasts toasts={toasts} />
    </AppContext.Provider>
  )
}
