import classnames from 'classnames'
import { Manrope } from 'next/font/google'

import '@/styles/globals.css'
import { createWeb3Modal, defaultConfig } from '@web3modal/ethers5/react'
import '@/lib/theme'
import { DARK_MODE, CHAINS } from '@/lib/const'

import { AppProvider } from '@/components/AppProvider'

const manrope = Manrope({ subsets: ['latin'] })

const projectId = process.env.NEXT_PUBLIC_WC_PROJECT_ID || '';

const metadata = {
  name: 'Atomic Lock-Mint',
  description: '',
  url: '',
  icons: ['/logo.png'],
}

createWeb3Modal({
  projectId,
  themeMode: DARK_MODE ? 'dark' : 'light',
  chains: CHAINS.filter(c => c.chainId !== 'tron'),
  chainImages: {},
  ethersConfig: defaultConfig({ metadata }),
  excludeWalletIds: [
    'a797aa35c0fadbfc1a53e7f675162ed5226968b44a19ee3d24385c64d1d3c393'
  ],
  themeVariables: {
    '--w3m-accent': '#6335FF',
  }
})

export default function App({ Component, pageProps }) {
  return (
    <AppProvider>
      <div className={classnames('app-container h-full', DARK_MODE && 'dark', manrope.className)}>
        <Component {...pageProps} />
      </div>
    </AppProvider>
  )
}
