import classnames from 'classnames'

export default function TokenIcon ({ size, token, className }) {
  const _className = classnames(
    size === 'sm' ? 'w-4 h-4' : 'w-6 h-6',
    className || 'mr-2',
  )

  if (token === 'eth' || token === 'beth') {
    return <img src='/tokens/eth.png' className={_className} />
  } else if (token === 'btc' || token === 'btcb' || token === 'fbtc') {
    return <img src='/tokens/btc.png' className={_className} />
  } else if (token === 'm-btc') {
    return <img src='/tokens/mbtc.png' className={_className} />
  } else if (token?.includes('solvbtc.bbn')) {
    return <img src='/tokens/solvbtc_bbn.png' className={_className} />
  } else if (token?.includes('solvbtc.ena')) {
    return <img src='/tokens/solvbtc_ena.png' className={_className} />
  } else if (token?.includes('solvbtc.m')) {
    return <img src='/tokens/solvbtc_m.png' className={_className} />
  } else if (token?.includes('solvbtc.b')) {
    return <img src='/tokens/solvbtc_b.png' className={_className} />
  } else if (token?.includes('solvbtc.a')) {
    return <img src='/tokens/solvbtc_a.png' className={_className} />
  } else if (token?.includes('solvbtc')) {
    return <img src='/tokens/solvbtc.png' className={_className} />
  } else if (token === 'bbtc') {
    return <img src='/tokens/bbtc.png' className={_className} />
  } else if (token === 'usdc' || token === 'm-usdc' || token === 'busdc') {
    return <img src='/tokens/usdc.png' className={_className} />
  } else if (token === 'usdt' || token === 'm-usdt' || token === 'busdt') {
    return <img src='/tokens/usdt.png' className={_className} />
  } else if (token === 'unibtc') {
    return <img src='/tokens/unibtc.png' className={_className} />
  } else if (token === 'pumpbtc') {
    return <img src='/tokens/pumpbtc.png' className={_className} />
  } else if (token === 'ubtc') {
    return <img src='/tokens/ubtc.png' className={_className} />
  } else if (token === 'fdusd') {
    return <img src='/tokens/fdusd.png' className={_className} />
  } else if (token === 'bbusd') {
    return <img src='/tokens/bbusd.png' className={_className} />
  } else if (token === 'arb') {
    return <img src='/tokens/arb.png' className={_className} />
  } else if (token === 'bnb' || token === 'opbnb') {
    return <img src='/tokens/bnb.png' className={_className} />
  } else if (token === 'polygon' || token === 'pol') {
    return <img src='/tokens/polygon.png' className={_className} />
  } else if (token === 'opt') {
    return <img src='/tokens/opt.png' className={_className} />
  } else if (token === 'avax') {
    return <img src='/tokens/avax.png' className={_className} />
  } else if (token === 'base') {
    return <img src='/tokens/base.png' className={_className} />
  } else if (token === 'linea') {
    return <img src='/tokens/linea.png' className={_className} />
  } else if (token === 'zksync') {
    return <img src='/tokens/zksync.png' className={_className} />
  } else if (token === 'scroll') {
    return <img src='/tokens/scroll.png' className={_className} />
  } else if (token === 'mode') {
    return <img src='/tokens/mode.png' className={_className} />
  } else if (token === 'manta') {
    return <img src='/tokens/manta.png' className={_className} />
  } else if (token === 'zklink') {
    return <img src='/tokens/zklink.png' className={_className} />
  } else if (token === 'core') {
    return <img src='/tokens/core.png' className={_className} />
  } else if (token === 'okb') {
    return <img src='/tokens/okb.png' className={_className} />
  } else if (token === 'xlayer') {
    return <img src='/tokens/xlayer.png' className={_className} />
  } else if (token === 'mantle' || token === 'mnt') {
    return <img src='/tokens/mantle.png' className={_className} />
  } else if (token === 'merl' || token === 'merlin') {
    return <img src='/tokens/merlin.png' className={_className} />
  } else if (token === 'b2') {
    return <img src='/tokens/b2.png' className={_className} />
  } else if (token === 'bitlayer') {
    return <img src='/tokens/bitlayer.png' className={_className} />
  } else if (token === 'bevm') {
    return <img src='/tokens/bevm.png' className={_className} />
  } else if (token === 'bb') {
    return <img src='/tokens/bb.png' className={_className} />
  } else if (token === 'bob') {
    return <img src='/tokens/bob.png' className={_className} />
  } else if (token === 'kava') {
    return <img src='/tokens/kava.png' className={_className} />
  } else if (token === 'kroma') {
    return <img src='/tokens/kroma.png' className={_className} />
  } else if (token === 'kaia') {
    return <img src='/tokens/kaia.png' className={_className} />
  } else if (token === 'ailayer') {
    return <img src='/tokens/ailayer.png' className={_className} />
  } else if (token === 'zircuit') {
    return <img src='/tokens/zircuit.png' className={_className} />
  } else if (token === 'iotex' || token === 'iotx') {
    return <img src='/tokens/iotex.png' className={_className} />
  } else if (token === 'zeta') {
    return <img src='/tokens/zeta.png' className={_className} />
  } else if (token === 'taiko') {
    return <img src='/tokens/taiko.png' className={_className} />
  } else if (token === 'sei') {
    return <img src='/tokens/sei.png' className={_className} />
  } else if (token === 'duck') {
    return <img src='/tokens/duck.png' className={_className} />
  } else if (token === 'morph') {
    return <img src='/tokens/morph.png' className={_className} />
  } else if (token === 'tron' || token === 'trx') {
    return <img src='/tokens/tron.png' className={_className} />
  } else if (token === 'm-stone') {
    return <img src='/tokens/stone_merlin.png' className={_className} />
  } else if (token === 'bstone') {
    return <img src='/tokens/stone_b2.png' className={_className} />
  } else if (token?.includes('stone')) {
    return <img src='/tokens/stone.png' className={_className} />
  } else if (token === 'bdgm') {
    return <img src='/tokens/bdgm.png' className={_className} />
  }
  return <div className={_className} />
}
