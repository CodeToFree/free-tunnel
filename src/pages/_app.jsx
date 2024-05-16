import classnames from 'classnames'
import { Manrope } from 'next/font/google'
import SafeProvider from '@safe-global/safe-apps-react-sdk'

import '@/styles/globals.css'
import { createWeb3Modal, defaultConfig } from '@web3modal/ethers5/react'
import '@/lib/theme'
import { DARK_MODE, CHAINS_FROM, CHAINS_TO, BRIDGE_CHANNEL } from '@/lib/const'

import { AppProvider } from '@/components/AppProvider'

const manrope = Manrope({ subsets: ['latin'] })

const projectId = process.env.NEXT_PUBLIC_WC_PROJECT_ID || '';

const metadata = {
  name: BRIDGE_CHANNEL,
  description: '',
  url: '',
  icons: ['/logo.png'],
}

createWeb3Modal({
  projectId,
  themeMode: DARK_MODE ? 'dark' : 'light',
  chains: [...CHAINS_TO, ...CHAINS_FROM].filter(c => c.chainId !== 'tron'),
  chainImages: {
    5: '/tokens/eth.png', // goerli
    11155111: '/tokens/eth.png', // sepolia
    59144: '/tokens/linea.png',
    34443: '/tokens/mode.png',
    169: '/tokens/manta.png',
    810180: '/tokens/zklink.png',
    4200: '/tokens/merlin.png',
    686868: '/tokens/merlin.png',
    223: '/tokens/b2.png',
    1102: '/tokens/b2.png',
    200901: '/tokens/bitlayer.png',
    11501: '/tokens/bevm.png',
  },
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
    <SafeProvider>
      <AppProvider>
        <div className={classnames('app-container h-full', DARK_MODE && 'dark', manrope.className)}>
          <Component {...pageProps} />
        </div>
      </AppProvider>
    </SafeProvider>
  )
}
