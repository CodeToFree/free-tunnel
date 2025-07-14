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
  const url = apiPath.startsWith('http') ? apiPath : `${NEXT_PUBLIC_API_URL}/${apiPath}`
  const res = await fetch(url, option)
  const result = await res.json()
  if (result.result) {
    return result.result
  } else {
    const err = new Error(result.error.message)
    err.code = result.error.code
    throw err
  }
}

export async function getRequests(tunnelId, proposer) {
  const reqs = await fetcher(`api/v1/request/${tunnelId}/${proposer}`)
  return reqs.map(({ _id, ...rest }) => ({ id: _id, ...rest }))
}

export async function getTunnelRequests(tunnelId) {
  return await fetcher(`api/v1/request/${tunnelId}`)
}

export async function getAllRequests() {
  return await fetcher(`api/v1/request`)
}

export async function postRequest(tunnelId, proposer, reqId, recipient, hash) {
  await fetcher(`api/v1/request/${tunnelId}`, 'POST', { proposer, reqId, recipient, hash })
}

export async function updateRequest(tunnelId, proposer, reqId, { signature, hash }) {
  await fetcher(`https://tunnel.free.tech/api/v1/request/${tunnelId}/${proposer}/${reqId}`, 'PUT', { signature, hash })
}
