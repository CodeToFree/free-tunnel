const NEXT_PUBLIC_API_URL = process.env.NEXT_PUBLIC_API_URL || ''

const headers = {
  'Content-Type': 'application/json',
}

export async function fetcher(apiPath, method = 'GET', data) {
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

export async function getRequests(channelId, proposer) {
  const reqs = await fetcher(`api/v1/request/${channelId}/${proposer}`)
  return reqs.map(({ _id, ...rest }) => ({ id: _id, ...rest }))
}

export async function getChannelRequests(channelId) {
  return await fetcher(`api/v1/request/${channelId}`)
}

export async function getAllRequests() {
  return await fetcher(`api/v1/request`)
}

export async function postRequest(channelId, proposer, reqId, recipient, hash) {
  await fetcher(`api/v1/request/${channelId}`, 'POST', { proposer, reqId, recipient, hash })
}

export async function updateRequest(channelId, proposer, reqId, { signature, hash }) {
  await fetcher(`api/v1/request/${channelId}/${proposer}/${reqId}`, 'PUT', { signature, hash })
}
