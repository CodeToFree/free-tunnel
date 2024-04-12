import React from 'react'
import { Card, Label } from 'flowbite-react'

import { ROLES } from '@/lib/const'
import { parseRequest } from '@/lib/request'
import { getAllRequests } from '@/lib/api'
import { useRequests, useRequestsMethods } from '@/stores'

import { capitalize } from './lib'
import RequestItem from './RequestItem'

export default function CardRequestsForExecutor ({ action = 'lock-mint', tokens, exes }) {
  const fromActionName = capitalize(action.split('-')[0])
  const toActionName = capitalize(action.split('-')[1])

  const requests = useRequests()
  const actionId = action === 'lock-mint' ? 1 : 2
  const reqs = React.useMemo(() => {
    return requests?.map(({ id, ...rest }) => ({ ...parseRequest(id), ...rest }))
      .filter(req => (req.actionId & 0x0f) === actionId)
      .sort((x, y) => y.created - x.created) || []
  }, [requests, actionId])

  const { updateAllRequests } = useRequestsMethods()
  React.useEffect(() => {
    getAllRequests().then(reqs => updateAllRequests(reqs))
  }, [updateAllRequests])

  return (
    <Card className='w-full'>
      <div>
        <div className='mb-1 flex'>
          <Label value={`${fromActionName}-${toActionName} Requests`} />
        </div>
        {!reqs.length && <div className='text-gray-500'>(None)</div>}
        {reqs.map(req => <RequestItem key={`req-${req.id}`} {...req} tokens={tokens} role={ROLES.Executor} action={action} exes={exes} />)}
      </div>
    </Card>
  )
}
