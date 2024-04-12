import React from 'react'
import { Button } from 'flowbite-react'
import { useChain } from '@/lib/hooks'
import { TokenIcon } from '@/components/ui'

export default function TokenSelector({ tokens, noSelect, onChange }) {
  const chain = useChain()

  const [selected, setSelected] = React.useState()

  const onChangeToken = React.useCallback(token => {
    if (!noSelect) {
      setSelected(token?.addr)
      onChange?.(token)
    }
  }, [noSelect, onChange])

  React.useEffect(() => {
    if (!tokens.length || noSelect) {
      onChangeToken()
    } else if (!tokens.find(t => t.addr === selected)) {
      onChangeToken(tokens[0])
    }
  }, [tokens, noSelect, selected, onChangeToken])

  if (!tokens.length) {
    return <div className='h-[38px] text-gray-500'>(No Supported Tokens)</div>
  }

  return (
    <div className='flex flex-wrap gap-2'>
    {
      tokens.map(t => (
        <Button
          key={t.addr}
          pill
          size='sm'
          color={selected === t.addr ? 'purple' : 'light'}
          className='pr-2'
          onClick={() => onChangeToken(t)}
        >
          <TokenIcon token={t.icon || chain?.tokens[t.addr]?.toLowerCase()} />{t.name || chain?.tokens[t.addr]}
        </Button>
      ))
    }
    </div>
  )
}
