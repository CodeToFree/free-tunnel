import React from 'react'
import { Card, Button, Badge, Label } from 'flowbite-react'

import { ROLES } from '@/lib/const'
import { parseRequest, ACTION_IDS } from '@/lib/request'
import { useRequests } from '@/stores'

import { useFreeTunnel } from '@/components/AppProvider'
import { PaginationButtons } from '@/components/ui'

import { capitalize } from './lib'
import RequestItem from './RequestItem'

export default function CardRequestsForProposer ({ action = 'lock-mint', tokens, proposer, role, exes }) {
  const { tunnel } = useFreeTunnel()

  const fromActionName = capitalize(action.split('-')[0])
  const toActionName = capitalize(action.split('-')[1])

  const requests = useRequests(tunnel.id, role === ROLES.Proposer ? '' : (proposer || 'n/a'))
  const actionId = ACTION_IDS[action]
  const allReqs = React.useMemo(() => {
    return requests?.map(({ id, ...rest }) => ({ ...parseRequest(id), ...rest }))
      .filter(req => (req.actionId & 0x0f) === actionId)
      .sort((x, y) => y.created - x.created) || []
  }, [requests, actionId])

  const threshold = exes?.threshold.toNumber()
  const [tab, setTab] = React.useState(role === ROLES.Proposer ? 'propose' : 'pending')
  React.useEffect(() => {
    if (role === ROLES.Proposer) {
      setTab('propose')
    } else {
      setTab('pending')
    }
  }, [role])

  const { reqs, nPending, nPropose, nSign, nExecute, nFinished, nCancelled } = React.useMemo(() => {
    const pending = allReqs.filter(req => (!req.hash?.e2 && !req.hash?.c2 && req.hash?.p2) || (!req.hash?.e1 && !req.hash?.c1 && req.hash?.p1))
    const propose = allReqs.filter(req => !req.hash?.p2 && !req.hash?.c1)
    const sign = allReqs.filter(req => !((req.hash?.c2 || !req.hash?.p2) && (req.hash?.c1 || !req.hash?.p1)) && req.hash?.p2 && req.signatures?.length < threshold)
    const execute = allReqs.filter(req => !((req.hash?.c2 || !req.hash?.p2) && (req.hash?.c1 || !req.hash?.p1)) && !(req.hash?.e2 && req.hash?.e1) && req.signatures?.length >= threshold)
    const finished = allReqs.filter(req => req.hash?.e2 && req.hash?.e1)
    const cancelled = allReqs.filter(req => (req.hash?.c2 || !req.hash?.p2) && (req.hash?.c1 || !req.hash?.p1))

    const reqsByTab = { pending, propose, sign, execute, finished, cancelled }
    return { reqs: reqsByTab[tab], nPending: pending.length, nPropose: propose.length, nSign: sign.length, nExecute: execute.length, nFinished: finished.length, nCancelled: cancelled.length }
  }, [allReqs, tab, threshold])

  const size = 10
  const [page, setPage] = React.useState(0)

  const onChangeTab = React.useCallback(tab => {
    setPage(0)
    setTab(tab)
  }, [])

  return (
    <Card className='w-full'>
      <div>
        <div className='mb-2 flex justify-between'>
          <Label value={`${fromActionName}-${toActionName} Requests`} />
        </div>
        <div className='mb-3'>
        {
          role === ROLES.Proposer
          ? <Button.Group className='w-auto'>
              <Button size='xs' color={tab === 'propose' ? 'info' : 'gray'} className='pr-0' onClick={() => onChangeTab('propose')}>
                Propose {nPropose > 0 && <Badge color='warning' className='ml-1 -mr-0.5 px-1 py-0 rounded-xl text-[10px]'>{nPropose}</Badge>}
              </Button>
              <Button size='xs' color={tab === 'sign' ? 'info' : 'gray'} className='pr-0' onClick={() => onChangeTab('sign')}>
                Sign {nSign > 0 && <Badge color='warning' className='ml-1 -mr-0.5 px-1 py-0 rounded-xl text-[10px]'>{nSign}</Badge>}
              </Button>
              <Button size='xs' color={tab === 'execute' ? 'info' : 'gray'} className='pr-0' onClick={() => onChangeTab('execute')}>
                Execute {nExecute > 0 && <Badge color='warning' className='ml-1 -mr-0.5 px-1 py-0 rounded-xl text-[10px]'>{nExecute}</Badge>}
              </Button>
              <Button size='xs' color={tab === 'finished' ? 'info' : 'gray'} className='pr-0' onClick={() => onChangeTab('finished')}>
                Finished {nFinished > 0 && <Badge color='success' className='ml-1 -mr-0.5 px-1 py-0 rounded-xl text-[10px]'>{nFinished}</Badge>}
              </Button>
              <Button size='xs' color={tab === 'cancelled' ? 'info' : 'gray'} onClick={() => onChangeTab('cancelled')}>
                Cancelled {nCancelled > 0 && <Badge color='gray' className='ml-1 -mr-0.5 px-1 py-0 rounded-xl text-[10px]'>{nCancelled}</Badge>}
              </Button>
            </Button.Group>
          : <Button.Group className='w-auto'>
              <Button size='xs' color={tab === 'pending' ? 'info' : 'gray'} className='pr-0' onClick={() => onChangeTab('pending')}>
                Pending {nPending > 0 && <Badge color='warning' className='ml-1 -mr-0.5 px-1 py-0 rounded-xl text-[10px]'>{nPending}</Badge>}
              </Button>
              <Button size='xs' color={tab === 'finished' ? 'info' : 'gray'} className='pr-0' onClick={() => onChangeTab('finished')}>
                Finished {nFinished > 0 && <Badge color='success' className='ml-1 -mr-0.5 px-1 py-0 rounded-xl text-[10px]'>{nFinished}</Badge>}
              </Button>
              <Button size='xs' color={tab === 'cancelled' ? 'info' : 'gray'} onClick={() => onChangeTab('cancelled')}>
                Cancelled {nCancelled > 0 && <Badge color='gray' className='ml-1 -mr-0.5 px-1 py-0 rounded-xl text-[10px]'>{nCancelled}</Badge>}
              </Button>
            </Button.Group>
        }
        </div>
        {!reqs.length && <div className='text-gray-500'>(None)</div>}
        {
          reqs.slice(page * size, (page + 1) * size)
            .map(req => <RequestItem key={`req-${req.id}`} proposer={proposer} {...req} tokens={tokens} role={role} action={action} exes={exes} />)
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
