import React from 'react'
import { Card, Button, Label } from 'flowbite-react'

import { ROLES } from '@/lib/const'
import { parseRequest } from '@/lib/request'
import { useRequests } from '@/stores'

import { PaginationButtons } from '@/components/ui'

import { capitalize } from './lib'
import RequestItem from './RequestItem'

export default function CardRequestsForProposer ({ action = 'lock-mint', tokens, proposer, role, exes }) {
  const fromActionName = capitalize(action.split('-')[0])
  const toActionName = capitalize(action.split('-')[1])

  const requests = useRequests(role === ROLES.Proposer ? '' : (proposer || 'n/a'))
  const actionId = action === 'lock-mint' ? 1 : 2
  const [finished, setFinished] = React.useState(false)
  const reqs = React.useMemo(() => {
    return requests?.map(({ id, ...rest }) => ({ ...parseRequest(id), ...rest }))
      .filter(req => (req.actionId & 0x0f) === actionId)
      .filter(req => !!(req.hash?.e2 && req.hash?.e1) === finished)
      .sort((x, y) => y.created - x.created) || []
  }, [requests, actionId, finished])

  const size = 10
  const [page, setPage] = React.useState(0)

  return (
    <Card className='w-full'>
      <div>
        <div className='mb-1 flex justify-between'>
          <div className='flex items-center'>
            <Label value={`${fromActionName}-${toActionName} Requests`} />
            {
              requests?.length > 0 &&
              <Button size='xs' className='ml-2' color={finished ? 'info' : 'gray'} onClick={() => setFinished(x => !x)}>
                Finished
              </Button>
            }
          </div>
          <Label value={`Total: ${reqs.length}`} />
        </div>
        {!reqs.length && <div className='text-gray-500'>(None)</div>}
        {
          reqs.slice(page * size, (page + 1) * size)
            .map(req => <RequestItem key={`req-${req.id}`} {...req} tokens={tokens} role={role} action={action} proposer={proposer} exes={exes} />)
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
