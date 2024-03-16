export const createReuestSlice = (set) => ({
    requests: [],
    addReuest: (request) => set((state) => ({ requests: [...state.requests, request] }))
})