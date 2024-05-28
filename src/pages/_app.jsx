import classnames from 'classnames'
import { Manrope } from 'next/font/google'
import SafeProvider from '@safe-global/safe-apps-react-sdk'

import '@/styles/globals.css'
import '@/lib/theme'
import { DARK_MODE } from '@/lib/const'

const manrope = Manrope({ subsets: ['latin'] })

export default function App({ Component, pageProps }) {
  return (
    <SafeProvider>
      <div className={classnames('app-container h-full', DARK_MODE && 'dark', manrope.className)}>
        <Component {...pageProps} />
      </div>
    </SafeProvider>
  )
}
