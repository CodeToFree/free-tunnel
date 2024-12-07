import mongoose from 'mongoose'

export const ChannelSchema = mongoose.Schema({
  _id: String,
  priority: Number,
  name: String,
  homepage: String,
  logo: String,
  lock: String,
  mint: String,
  from: [String],
  to: [String],
  contracts: {
    type: Object,
    get (obj) {
      return Object.fromEntries(Object.entries(obj).map(([k, v]) => {
        if (v === 'lock') {
          return [k, this.lock]
        } else if (v === 'mint') {
          return [k, this.mint]
        }
        return [k, v]
      }))
    },
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
