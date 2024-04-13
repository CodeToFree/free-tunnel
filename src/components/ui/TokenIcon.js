import classnames from 'classnames'

export default function TokenIcon ({ size, token, className }) {
  const _className = classnames(
    size === 'sm' ? 'w-4 h-4' : 'w-6 h-6',
    className || 'mr-2',
    !token && 'rounded-full bg-gray-500',
  )

  if (token === 'eth') {
    return <img src='/tokens/eth.png' className={_className} />
  } else if (token === 'btc') {
    return <img src='/tokens/btc.png' className={_className} />
  } else if (token === 'm-btc') {
    return <img src='/tokens/mbtc.png' className={_className} />
  } else if (token === 'usdc') {
    return <img src='/tokens/usdc.png' className={_className} />
  } else if (token === 'usdt') {
    return <img src='/tokens/usdt.png' className={_className} />
  } else if (token === 'arb') {
    return <img src='/tokens/arb.png' className={_className} />
  } else if (token === 'mode') {
    return <img src='/tokens/mode.png' className={_className} />
  } else if (token === 'merlin') {
    return <img src='/tokens/merlin.png' className={_className} />
  } else if (token === 'b2') {
    return <img src='/tokens/b2.png' className={_className} />
  } else if (token === 'bitlayer') {
    return <img src='/tokens/bitlayer.png' className={_className} />
  } else if (token === 'tron' || token === 'trx') {
    return <img src='/tokens/tron.png' className={_className} />
  }
  return <div className={_className} />
}
