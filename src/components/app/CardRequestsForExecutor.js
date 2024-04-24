import React from 'react'
import { Card, Label } from 'flowbite-react'

import { ROLES } from '@/lib/const'
import { parseRequest } from '@/lib/request'
import { getAllRequests } from '@/lib/api'
import { useRequests, useRequestsMethods } from '@/stores'

import { PaginationButtons } from '@/components/ui'

import { capitalize } from './lib'
import RequestItem from './RequestItem'

export default function CardRequestsForExecutor ({ action = 'lock-mint', tokens, exes }) {
  const fromActionName = capitalize(action.split('-')[0])
  const toActionName = capitalize(action.split('-')[1])

  const requests = useRequests('executor')
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

  const size = 10
  const [page, setPage] = React.useState(0)

  return (
    <Card className='w-full'>
      <div>
        <div className='mb-1 flex justify-between'>
          <Label value={`${fromActionName}-${toActionName} Requests`} />
          <Label value={`Total: ${reqs.length}`} />
        </div>
        {!reqs.length && <div className='text-gray-500'>(None)</div>}
        {
          reqs.slice(page * size, (page + 1) * size)
            .map(req => <RequestItem key={`req-${req.id}`} {...req} tokens={tokens} role={ROLES.Executor} action={action} exes={exes} />)
        }
        {
          reqs?.length > 10 &&
          <PaginationButtons
            page={page}
            pages={Math.ceil(reqs.length / 10)}
            total={reqs.length}
            onPageChange={setPage}
          />
        }
      </div>
    </Card>
  )
}
