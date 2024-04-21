import mongoose from 'mongoose'

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
