import mongoose from 'mongoose'

import {
  RequestSchema,
} from './schema'

mongoose.pluralize(null)

const db = mongoose.createConnection(process.env.MONGO_URL)
db.on('connection', () => console.log('[mongodb] DB Connected!'))
db.on('error', err => console.warn('[mongodb] DB', err.message))

export const Requests = db.model('free_reqs', RequestSchema)
