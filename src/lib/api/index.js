const NEXT_PUBLIC_API_URL = process.env.NEXT_PUBLIC_API_URL

const headers = {
  'Content-Type': 'application/json',
}

async function _fetch(apiPath, method = 'GET', data) {
  const option = {
    method,
    headers,
  }
  if (method === 'POST') {
    option.body = JSON.stringify(data)
  }
  const res = await fetch(`${NEXT_PUBLIC_API_URL}/${apiPath}`, option)
  const result = await res.json()
  if (!result.code) {
    return result.data
  } else {
    const err = new Error(result.msg)
    err.code = result.code
    throw err
  }
}
