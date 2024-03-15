export default function TokenIcon ({ token }) {
  if (token === 'eth') {
    return <img src='/tokens/eth.png' className='w-6 h-6 mr-2'/>
  } else if (token === 'b2') {
    return <img src='/tokens/b2.png' className='w-6 h-6 mr-2'/>
  } else if (token === 'tron' || token === 'trx') {
    return <img src='/tokens/tron.png' className='w-6 h-6 mr-2'/>
  } else if (token === 'usdc') {
    return <img src='/tokens/usdc.png' className='w-6 h-6 mr-2'/>
  } else if (token === 'usdt') {
    return <img src='/tokens/usdt.png' className='w-6 h-6 mr-2'/>
  }
  return <div className='rounded bg-gray-500 w-6 h-6 mr-2'/>
}
