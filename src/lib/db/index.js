import mongoose from 'mongoose'

import {
  TunnelSchema,
  RequestSchema,
  FeeSchema,
  MsgCacheSchema
} from './schema'

mongoose.pluralize(null)

const db = mongoose.createConnection(process.env.MONGO_URL)
db.on('connection', () => console.log('[mongodb] DB Connected!'))
db.on('error', err => console.warn('[mongodb] DB', err.message))

export const Tunnels = db.model('free_channels', TunnelSchema)
export const Requests = db.model('free_reqs', RequestSchema)
export const Fees = db.model('free_fees', FeeSchema)
export const MsgCache = db.model('free_msg_cache', MsgCacheSchema)
