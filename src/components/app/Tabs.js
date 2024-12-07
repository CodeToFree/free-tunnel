import { Button } from 'flowbite-react'
import { useRouter } from 'next/router'

export default function Tabs ({ isBurnMint, isAdmin }) {
  const router = useRouter()

  const buttons = [
    <Button
      key='lock'
      color={router.route === '/[tunnelId]' ? 'purple' : 'gray'}
      size='sm'
      className='flex-1'
      onClick={() => router.push(`/${router.query.tunnelId}`)}
    >
      {isBurnMint ? 'Burn-Mint' : 'Lock-Mint'}
    </Button>,
    !isBurnMint &&
    <Button
      key='unlock'
      color={router.route === '/[tunnelId]/unlock' ? 'purple' : 'gray'}
      size='sm'
      className='flex-1'
      onClick={() => router.push(`/${router.query.tunnelId}/unlock`)}
    >
      Burn-Unlock
    </Button>,
    isAdmin &&
    <Button
      key='admin'
      color={router.route === '/[tunnelId]/admin' ? 'purple' : 'gray'}
      size='sm'
      className='flex-1'
      onClick={() => router.push(`/${router.query.tunnelId}/admin`)}
    >
      Admin
    </Button>
  ].filter(Boolean)

  if (buttons.length > 1) {
    return <Button.Group>{buttons}</Button.Group>
  }

  return <div className='flex w-full'>{buttons[0]}</div>
}