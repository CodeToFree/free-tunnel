import React from 'react'
import { Button } from 'flowbite-react'
import { useChain } from '@/lib/hooks'
import { TokenIcon } from '@/components/ui'

export default function TokenSelector({ options, noSelect, onChange }) {
  const chain = useChain()

  const [selected, setSelected] = React.useState()

  const onChangeOption = React.useCallback(opt => {
    if (!noSelect) {
      setSelected(opt?.id)
      onChange?.(opt)
    }
  }, [noSelect, onChange])

  React.useEffect(() => {
    if (!options.length || noSelect) {
      onChangeOption()
    } else if (!options.find(t => t.id === selected)) {
      onChangeOption(options[0])
    }
  }, [options, noSelect, selected, onChangeOption])

  if (!options.length) {
    return <div className='h-[38px] text-gray-500'>(No Supported Tokens)</div>
  }

  return (
    <div className='flex flex-wrap gap-2'>
    {
      options.map(opt => (
        <Button
          key={opt.id}
          pill
          size='sm'
          color={selected === opt.id ? 'purple' : 'light'}
          className='pr-2'
          onClick={() => onChangeOption(opt)}
        >
          <TokenIcon chain={opt} token={chain?.tokens[opt.addr]?.toLowerCase()} />{opt.name || chain?.tokens[opt.addr]}
        </Button>
      ))
    }
    </div>
  )
}
