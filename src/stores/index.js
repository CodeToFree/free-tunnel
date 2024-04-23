import React from 'react'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const useStoreRequests = create(persist(
  set => ({
    requests: {},
    addRequest: (proposer, reqId, recipient, hash) => (
      set(state => ({ ...state, requests: {
        ...state.requests,
        [proposer]: [...(state.requests[proposer] || []), { id: reqId, recipient, hash: { p1: hash } }],
      } }))
    ),
    updateProposerRequests: (proposer, reqs) => (
      set(state => ({ ...state, requests: {
        ...state.requests,
        [proposer]: reqs,
      } }))
    ),
    updateAllRequests: requests => set(state => ({ ...state, requests })),
    addRequestSignature: (proposer, reqId, { sig, exe }) => (
      set(state => ({ ...state, requests: {
        ...state.requests,
        [proposer]: state.requests[proposer]?.map(req => req.id !== reqId ? req : ({ ...req, signatures: [...(req.signatures || []), { sig, exe }] })),
      } }))
    ),
    updateRequestHash: (proposer, reqId, hash) => (
      set(state => ({ ...state, requests: {
        ...state.requests,
        [proposer]: state.requests[proposer]?.map(req => req.id !== reqId ? req : ({ ...req, hash: { ...req.hash, ...hash } })),
      } }))
    ),
  }),
  {
    name: 'req' // store-requests
  }
))


export function useRequests (proposer) {
  const requests = useStoreRequests(state => state.requests)
  return React.useMemo(() => {
    if (proposer && proposer !== 'executor') {
      return requests[proposer] || []
    }
    const reqs = Object.entries(requests)
      .map(([proposer, reqs]) => reqs.map(req => ({ ...req, proposer })))
      .flat()
    if (proposer === 'executor') {
      return reqs.filter(req => !!req.hash?.p2)
    }
    return reqs
  }, [proposer, requests])
}

export function useRequestsMethods () {
  const addRequest = useStoreRequests(state => state.addRequest)
  const updateProposerRequests = useStoreRequests(state => state.updateProposerRequests)
  const updateAllRequests = useStoreRequests(state => state.updateAllRequests)
  const addRequestSignature = useStoreRequests(state => state.addRequestSignature)
  const updateRequestHash = useStoreRequests(state => state.updateRequestHash)

  return {
    addRequest,
    updateProposerRequests,
    updateAllRequests,
    addRequestSignature,
    updateRequestHash,
  }
}
