import { Html, Head, Main, NextScript } from 'next/document'

import { PROJECT_ICON } from '@/lib/const'

export default function Document() {
  return (
    <Html lang='en'>
      <Head>
        <link rel='icon' sizes='32x32' href={PROJECT_ICON} />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}
