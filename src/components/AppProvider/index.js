import React from 'react'

import Toasts, { useToast } from './Toasts'
import useTronLink from './useTronLink'

const AppContext = React.createContext()

export const useAppHooks = () => React.useContext(AppContext)

export function AppProvider ({ children }) {
  const { toasts, addToast, removeToast } = useToast()
  const tronlink = useTronLink(addToast)

  return (
    <AppContext.Provider value={{ addToast, removeToast, tronlink }}>
      {children}
      <Toasts toasts={toasts} />
    </AppContext.Provider>
  )
}
