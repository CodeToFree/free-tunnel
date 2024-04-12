import React from 'react'
import { Card, Label } from 'flowbite-react'

import { ROLES } from '@/lib/const'
import { parseRequest } from '@/lib/request'
import { useRequests } from '@/stores'

import { capitalize } from './lib'
import RequestItem from './RequestItem'

export default function CardRequestsForProposer ({ action = 'lock-mint', tokens, proposer, role, exes }) {
  const fromActionName = capitalize(action.split('-')[0])
  const toActionName = capitalize(action.split('-')[1])

  const requests = useRequests(role ? '' : proposer)
  const actionId = action === 'lock-mint' ? 1 : 2
  const reqs = React.useMemo(() => {
    return requests?.map(({ id, ...rest }) => ({ ...parseRequest(id), ...rest }))
      .filter(req => (req.actionId & 0x0f) === actionId)
      .sort((x, y) => y.created - x.created) || []
  }, [requests, actionId])

  return (
    <Card className='w-full'>
      <div>
        <div className='mb-1 flex'>
          <Label value={`${fromActionName}-${toActionName} Requests`} />
        </div>
        {!reqs.length && <div className='text-gray-500'>(None)</div>}
        {reqs.map(req => <RequestItem key={`req-${req.id}`} {...req} tokens={tokens} role={ROLES.Proposer} action={action} proposer={proposer} exes={exes} />)}
      </div>
    </Card>
  )
}
