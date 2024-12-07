import React from 'react'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

import { parseRequest } from '@/lib/request'

const useStoreRequests = create(persist(
  set => ({
    data: {},
    storeRequestAdd: (tunnelId, proposer, reqId, recipient, hash) => (
      set(({ data, ...actions }) => ({ ...actions, data: { ...data, [tunnelId]: {
        ...data[tunnelId],
        [proposer]: [...(data[tunnelId]?.[proposer] || []), { id: reqId, recipient, hash: { p1: hash } }],
      } } }))
    ),
    storeRequestUpdateForProposer: (tunnelId, proposer, reqs) => (
      set(({ data, ...actions }) => ({ ...actions, data: { ...data, [tunnelId]: {
        ...data[tunnelId],
        [proposer]: reqs,
      } } }))
    ),
    storeRequestUpdateForTunnel: (tunnelId, requests) => set(({ data, ...actions }) => ({ ...actions, data: { ...data, [tunnelId]: requests } })),
    storeRequestUpdateAll: requests => set(({ data, ...actions }) => ({ ...actions, data: requests })),
    storeRequestAddSignature: (tunnelId, proposer, reqId, { sig, exe }) => (
      set(({ data, ...actions }) => ({ ...actions, data: { ...data, [tunnelId]: {
        ...data[tunnelId],
        [proposer]: data[tunnelId]?.[proposer]?.map(req => req.id !== reqId ? req : ({ ...req, signatures: [...(req.signatures || []), { sig, exe }] })),
      } } }))
    ),
    storeRequestAddHash: (tunnelId, proposer, reqId, hash) => (
      set(({ data, ...actions }) => ({ ...actions, data: { ...data, [tunnelId]: {
        ...data[tunnelId],
        [proposer]: data[tunnelId]?.[proposer]?.map(req => req.id !== reqId ? req : ({ ...req, hash: { ...req.hash, ...hash } })),
      } } }))
    ),
  }),
  {
    name: 'free_requests'
  }
))


export function useAllPendingRequests (tunnels) {
  const state = useStoreRequests()
  return React.useMemo(() => {
    if (!tunnels || !state?.data) {
      return []
    }
    return Object.fromEntries(
      Object.entries(state.data)
        .filter(([tunnelId]) => tunnels.find(c => c.id === tunnelId))
        .map(([tunnelId, reqsByProposer]) => [
          tunnelId,
          Object.entries(reqsByProposer)
            .map(([proposer, reqs]) => reqs
              .filter(req => (!req.hash?.e1 && !req.hash?.c1) || (!(req.hash?.c1 && !req.hash?.p2) && !req.hash?.e2 && !req.hash?.c2))
              .map(req => {
                const parsed = parseRequest(req.id)
                const action =  (parsed.actionId & 0x0f) === 2 ? 'burn-unlock' : 'lock-mint'
                return { ...req, ...parsed, action, tunnelId, proposer }
              })
            )
            .flat()
            .sort((x, y) => y.created - x.created)
        ])
        .filter(([_, reqs]) => reqs.length > 0)
    )
  }, [tunnels, state])
}

export function useRequests (tunnelId, proposer) {
  const requests = useStoreRequests(state => state.data?.[tunnelId])
  return React.useMemo(() => {
    if (!requests) {
      return []
    }
    if (proposer && proposer !== 'executor') {
      return requests[proposer] || []
    }
    const reqs = Object.entries(requests)
      .map(([proposer, reqs]) => reqs.map(req => ({ ...req, proposer })))
      .flat()
    return reqs
  }, [proposer, requests])
}

export function useRequestsMethods () {
  const storeRequestAdd = useStoreRequests(state => state.storeRequestAdd)
  const storeRequestUpdateForProposer = useStoreRequests(state => state.storeRequestUpdateForProposer)
  const storeRequestUpdateForTunnel = useStoreRequests(state => state.storeRequestUpdateForTunnel)
  const storeRequestUpdateAll = useStoreRequests(state => state.storeRequestUpdateAll)
  const storeRequestAddSignature = useStoreRequests(state => state.storeRequestAddSignature)
  const storeRequestAddHash = useStoreRequests(state => state.storeRequestAddHash)

  return {
    storeRequestAdd,
    storeRequestUpdateForProposer,
    storeRequestUpdateForTunnel,
    storeRequestUpdateAll,
    storeRequestAddSignature,
    storeRequestAddHash,
  }
}
