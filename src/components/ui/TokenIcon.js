import classnames from 'classnames'

export default function TokenIcon ({ size, chain, token, className }) {
  const _className = classnames(
    size === 'sm' ? 'w-4 h-4' : 'w-6 h-6',
    className || 'mr-2',
  )

  if (chain?.icon) {
    return <img src={`https://static.meson.fi/icon/network/${chain.icon}.png`} className={_className} />
  }
  
  if (token === 'm-usdc' || token === 'busdc') {
    return <img src='https://static.meson.fi/icon/token/usdc.png' className={_className} />
  } else if (token === 'm-usdt' || token === 'busdt') {
    return <img src='https://static.meson.fi/icon/token/usdt.png' className={_className} />
  } else if (token === 'beth') {
    return <img src='https://static.meson.fi/icon/token/eth.png' className={_className} />
  } else if (token === 'btcb' || token === 'wbtc' || token === 'fbtc') {
    return <img src='https://static.meson.fi/icon/token/btc.png' className={_className} />
  } else if (token === 'm-btc') {
    return <img src='https://static.meson.fi/icon/token/mbtc.png' className={_className} />
  } else if (token === 'solvbtc.b') {
    return <img src='https://static.meson.fi/icon/token/solvbtc-b.png' className={_className} />
  } else if (token === 'solvbtc.m') {
    return <img src='https://static.meson.fi/icon/token/solvbtc-m.png' className={_className} />
  } else if (token === 'solvbtc.ena') {
    return <img src='https://static.meson.fi/icon/token/solvbtc-ena.png' className={_className} />
  } else if (token === 'solvbtc.jup') {
    return <img src='https://static.meson.fi/icon/token/solvbtc-jup.png' className={_className} />
  } else if (token === 'solvbtc.bera') {
    return <img src='https://static.meson.fi/icon/token/solvbtc-bera.png' className={_className} />
  } else if (token === 'm-stone') {
    return <img src='/tokens/stone_merlin.png' className={_className} />
  } else if (token === 'bstone') {
    return <img src='/tokens/stone_b2.png' className={_className} />
  } else if (token === 'bit-stone') {
    return <img src='https://static.meson.fi/icon/token/stone.png' className={_className} />
  } else if (token === 'wusd') {
    return <img src='/tokens/wusd.png' className={_className} />
  } else if (token === 'stbtc') {
    return <img src='/tokens/stbtc.png' className={_className} />
  } else if (token === 'ibtc') {
    return <img src='/tokens/ibtc.png' className={_className} />
  } else if (token === 'obtc.x') {
    return <img src='/tokens/obtcx.png' className={_className} />
  } else if (token === 'brbtc') {
    return <img src='/tokens/brbtc.png' className={_className} />
  } else if (token === 'b2') {
    return <img src='https://static.meson.fi/icon/network/b2.png' className={_className} />
  }
  
  // if (token === 'hype') {
  //   return <img src='/tokens/hype.png' className={_className} />
  // }
  // if (token === 'bdgm') {
  //   return <img src='/tokens/bdgm.png' className={_className} />
  // }

  return <img src={`https://static.meson.fi/icon/token/${token}.png`} className={_className} />
}
