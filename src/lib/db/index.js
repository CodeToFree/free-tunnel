import mongoose from 'mongoose'

import {
  ChannelSchema,
  RequestSchema,
} from './schema'

mongoose.pluralize(null)

const db = mongoose.createConnection(process.env.MONGO_URL)
db.on('connection', () => console.log('[mongodb] DB Connected!'))
db.on('error', err => console.warn('[mongodb] DB', err.message))

export const Channels = db.model('free_channels', ChannelSchema)
export const Requests = db.model('free_reqs', RequestSchema)
