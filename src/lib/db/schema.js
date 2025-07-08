import mongoose from 'mongoose'

export const TunnelSchema = mongoose.Schema({
  _id: String,
  priority: Number,
  name: String,
  homepage: String,
  logo: String,
  lock: {
    type: String,
    default: null,
  },
  mint: {
    type: String,
    default: null,
  },
  from: [String],
  to: [String],
  contracts: {
    type: Object,
    default: null,
  },
  min: Object,
  vault: Object,
  fee: String,
})

const SignatureSchema = new mongoose.Schema({
  sig: String,
  exe: String,
}, { _id: false })

export const RequestSchema = mongoose.Schema({
  _id: String,
  channel: String,
  from: String,
  to: String,
  proposer: String,
  recipient: String,
  hash: {
    p1: String,
    p2: String,
    e1: String,
    e2: String,
    c1: String,
    c2: String,
  },
  signatures: [SignatureSchema]
})

export const FeeSchema = mongoose.Schema({
  _id: String,
  rules: Object,
})

export const MsgCacheSchema = mongoose.Schema({
  _id: String,
  expireTs: Date,
  chatId: String,
  messageId: Number,
  message: String,
})

MsgCacheSchema.index({ expireTs: 1 }, { expireAfterSeconds: 0 })