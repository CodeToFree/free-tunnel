import React from 'react'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const useStoreRequests = create(persist(
  set => ({
    storeRequestAdd: (channelId, proposer, reqId, recipient, hash) => (
      set(state => ({ ...state, [channelId]: {
        ...state[channelId],
        [proposer]: [...(state[channelId]?.[proposer] || []), { id: reqId, recipient, hash: { p1: hash } }],
      } }))
    ),
    storeRequestUpdateForProposer: (channelId, proposer, reqs) => (
      set(state => ({ ...state, [channelId]: {
        ...state[channelId],
        [proposer]: reqs,
      } }))
    ),
    storeRequestUpdateAll: (channelId, requests) => set(state => ({ ...state, [channelId]: requests })),
    storeRequestAddSignature: (channelId, proposer, reqId, { sig, exe }) => (
      set(state => ({ ...state, [channelId]: {
        ...state[channelId],
        [proposer]: state[channelId]?.[proposer]?.map(req => req.id !== reqId ? req : ({ ...req, signatures: [...(req.signatures || []), { sig, exe }] })),
      } }))
    ),
    storeRequestAddHash: (channelId, proposer, reqId, hash) => (
      set(state => ({ ...state, [channelId]: {
        ...state[channelId],
        [proposer]: state[channelId]?.[proposer]?.map(req => req.id !== reqId ? req : ({ ...req, hash: { ...req.hash, ...hash } })),
      } }))
    ),
  }),
  {
    name: 'free_requests'
  }
))


export function useRequests (channelId, proposer) {
  const requests = useStoreRequests(state => state[channelId])
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
  const storeRequestUpdateAll = useStoreRequests(state => state.storeRequestUpdateAll)
  const storeRequestAddSignature = useStoreRequests(state => state.storeRequestAddSignature)
  const storeRequestAddHash = useStoreRequests(state => state.storeRequestAddHash)

  return {
    storeRequestAdd,
    storeRequestUpdateForProposer,
    storeRequestUpdateAll,
    storeRequestAddSignature,
    storeRequestAddHash,
  }
}
