import React from 'react'

export default function useTronLink(addToast) {
  const [tronAccount, setTronAccount] = React.useState(null)

  const tronlinkListener = React.useCallback(e => {
    const { isTronLink, message } = e.data
    if (!isTronLink || !message) {
      return
    }

    switch (message.action) {
      case 'tabReply':
      case 'connect':
      case 'disconnect':
        break
      case 'accountsChanged': {
        const address = message.data.address
        setTronAccount(window.tronLink.tronWeb.defaultAddress)
        break
      }
    }
  }, [])

  const h = React.useRef()

  const disconnect = React.useCallback(() => {
    clearInterval(h.current)
    window.removeEventListener('message', tronlinkListener)
    setTronAccount()
  }, [tronlinkListener])

  const connect = React.useCallback(async () => {
    if (!window.tronLink) {
      window.open('https://chromewebstore.google.com/detail/tronlink/ibnejdfjmmkpcnlpebklmnkoeoihofec', '_blank')
      return
    }
    await window.tronLink.request({ method: 'tron_requestAccounts' })
    const tronWeb = window.tronLink.tronWeb
    if (!tronWeb.ready) {
      addToast({ type: 'error', content: 'Connect TronLink failed. Unlock TronLink and try again.' })
      return
    }

    window.addEventListener('message', tronlinkListener)
    setTronAccount(tronWeb.defaultAddress)

    h.current = setInterval(() => {
      const connected = !!window.tronLink.tronWeb
      if (!connected) {
        disconnect()
      }
    }, 1000)
  }, [addToast, tronlinkListener, disconnect])

  return React.useMemo(() => ({
    connect,
    disconnect,
    account: tronAccount,
  }), [tronAccount, connect, disconnect])
}
