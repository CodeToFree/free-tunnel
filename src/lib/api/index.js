const NEXT_PUBLIC_API_URL = process.env.NEXT_PUBLIC_API_URL || ''

const headers = {
  'Content-Type': 'application/json',
}

async function _fetch(apiPath, method = 'GET', data) {
  const option = {
    method,
    headers,
  }
  if (method === 'POST' || method === 'PUT') {
    option.body = JSON.stringify(data)
  }
  const res = await fetch(`${NEXT_PUBLIC_API_URL}/${apiPath}`, option)
  const result = await res.json()
  if (result.result) {
    return result.result
  } else {
    const err = new Error(result.error.message)
    err.code = result.error.code
    throw err
  }
}

export async function getRequests(proposer) {
  const reqs = await _fetch(`api/v1/request/${proposer}`)
  return reqs.map(({ _id, ...rest }) => ({ id: _id, ...rest }))
}

export async function getAllRequests() {
  const result = await _fetch(`api/v1/request`)
  return Object.fromEntries(result.map(({ _id, reqs }) => [_id, reqs]))
}

export async function postRequest(proposer, reqId, recipient, hash) {
  await _fetch(`api/v1/request`, 'POST', { proposer, reqId, recipient, hash })
}

export async function updateRequest(proposer, reqId, { signature, hash }) {
  await _fetch(`api/v1/request/${proposer}/${reqId}`, 'PUT', { signature, hash })
}
