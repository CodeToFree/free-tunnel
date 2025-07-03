import { MSG_TOKEN, MSG_URL, CHAT_ID } from "@/lib/const"

const headers = {
  'Content-Type': 'application/json',
  authorization: `Bearer ${MSG_TOKEN}`
}
const fetcher = async (apiPath, method = 'GET', data) => {
  if (!MSG_URL || !MSG_TOKEN) {
    console.error('[msg config error]: Need to set MSG_URL and MSG_TOKEN')
    return
  }
  const option = {
    method,
    headers,
  }
  if (method === 'POST' || method === 'PUT') {
    option.body = JSON.stringify(data)
  }
  const res = await fetch(`${MSG_URL}/${apiPath}`, option)
  const result = await res.json()
  if (result.data) {
    return result.data
  } else {
    const err = new Error(result.error?.message)
    err.code = result.error?.code
    throw err
  }
}

export const sendMsg = async ({ message, chat_id, message_thread_id }) => {
  try {
    await fetcher(`api/tg/message`, 'POST', {
      message,
      chat_id: chat_id || CHAT_ID,
      message_thread_id // if in topics, should pass a thread id
    })
  } catch (error) {
    console.error(`[msg send error] `, error)
  }
}
