import React from 'react'
import { Label, TextInput } from 'flowbite-react'

import { TokenIcon } from '@/components/ui'
import {
  ConnectButton,
  ContractCallButton,
} from '@/components/web3'

import { useFreeChannel } from '@/components/AppProvider'
import { useChain, useERC20Query } from '@/lib/hooks'
import AtomicLock from '@/lib/abis/AtomicLock.json'
import AtomicMint from '@/lib/abis/AtomicMint.json'

export default function SectionAdmin ({ createToken = false }) {
  const chain = useChain()
  const { channel, contractAddr } = useFreeChannel(chain)

  const [step2, setStep2] = React.useState(false)
  const [fixedChain, setFixedChain] = React.useState(null)
  const [tokenAddr, setTokenAddr] = React.useState('')
  const [tokenIndex, setTokenIndex] = React.useState('')

  const tokenChain = createToken && fixedChain || chain
  const { result: name } = useERC20Query(tokenAddr, 'name', undefined, tokenChain)
  const { result: symbol } = useERC20Query(tokenAddr, 'symbol', undefined, tokenChain)
  const { result: decimals } = useERC20Query(tokenAddr, 'decimals', undefined, tokenChain)

  const tokenInfo = React.useMemo(() => {
    if (!name || !symbol || !decimals) {
      return ''
    }
    return [`Name: ${name}`, `Symbol: ${symbol}`, `Decimals: ${decimals}`].join('\n')
  }, [name, symbol, decimals])

  const args = React.useMemo(() => {
    if (createToken) {
      return [Number(tokenIndex), name, symbol, decimals]
    } else {
      return [Number(tokenIndex), tokenAddr]
    }
  }, [createToken, tokenIndex, tokenAddr, name, symbol, decimals])

  const callback = React.useCallback(() => {
    if (!step2) {
      setFixedChain(chain)
      setStep2(true)
    } else {
      setFixedChain(null)
      setStep2(false)
    }
  }, [chain, step2])

  return (
    <>
      <div>
        <div className='mb-2 flex justify-between'>
          <Label value={`${tokenChain?.name} ERC20 Token Address`} />
        </div>
        <div className='relative'>
          <TextInput
            id='token'
            type='text'
            value={tokenAddr}
            onChange={evt => setTokenAddr(evt.target.value)}
            disabled={step2 && createToken}
          />
        </div>
        <div className='mt-1 text-sm text-white'>{tokenInfo}</div>
      </div>
      <div>
        <div className='mb-2 flex justify-between'>
          <Label value={`Token Index`} />
        </div>
        <div className='relative'>
          <TextInput
            id='index'
            type='text'
            value={tokenIndex}
            onChange={evt => setTokenIndex(evt.target.value)}
            disabled={step2 && createToken}
          />
        </div>
      </div>

      <ConnectButton color='purple' forceChains={createToken && (step2 ? channel.to : channel.from)}>
        <ContractCallButton
          address={contractAddr}
          abi={step2 ? AtomicMint : AtomicLock}
          method={step2 && createToken ? 'createToken' : 'addToken'}
          args={args}
          callback={callback}
          disabled={!tokenInfo}
        >
          Add Token on <TokenIcon token={chain?.icon} className='mx-2' /> {chain?.name}
        </ContractCallButton>
      </ConnectButton>
    </>
  )
}
