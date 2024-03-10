import React from 'react'
import { Button } from 'flowbite-react'
import { useChain } from '@/lib/hooks'
import { TokenIcon } from '@/components/ui'

export default function TokenSelector({ onChange, extraTokens }) {
  const chain = useChain()

  const tokens = React.useMemo(() => {
    if (!chain) {
      return [{ symbol: 'ETH' }, { symbol: 'USDC' }, { symbol: 'USDT' }]
    }
    return Object.entries({ [chain?.currency]: true, ...chain?.tokens, ...extraTokens })
      .map(([symbol, addr]) => ({ symbol, addr }))
      .filter(t => t.addr)
  }, [chain, extraTokens])

  const [selected, setSelected] = React.useState()

  const onChangeToken = React.useCallback(token => {
    setSelected(token)
    onChange?.(token)
  }, [onChange])

  React.useEffect(() => {
    if (!tokens.length) {
      onChangeToken()
    } else if (!tokens.find(t => t.symbol === selected)) {
      onChangeToken(tokens[0].symbol)
    }
  }, [tokens, selected, onChangeToken])

  return (
    <div className='flex flex-wrap gap-2'>
    {
      tokens.map(t => (
        <Button
          key={t.symbol}
          pill
          size='sm'
          color={selected === t.symbol ? 'purple' : 'light'}
          className='pr-2'
          onClick={() => onChangeToken(t.symbol)}
        >
          <TokenIcon token={t.symbol.toLowerCase()} />{t.symbol}
        </Button>
      ))
    }
    </div>
  )
}