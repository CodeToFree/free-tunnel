import { create } from 'zustand'
import { createReuestSlice } from './createRequestSlice'

export const useBoundStore = create((...a) => ({
    ...createReuestSlice(...a),
}))