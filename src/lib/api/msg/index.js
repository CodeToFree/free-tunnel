import { MSG_TOKEN, MSG_URL, CHAT_ID } from "@/lib/const"
import { MsgCache } from "@/lib/db"

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
export const MsgCacheType = {
  NEED_PROPOSE: 'NEED_PROPOSE',
  NEED_FREE_SIGNATURE: 'NEED_FREE_SIGNATURE',
  NEED_PARTNER_SIGNATURE: 'NEED_PARTNER_SIGNATURE',
  NEED_EXECUTE: 'NEED_EXECUTE',
}

export const sendMsg = async (params) => {
  try {
    const { cache_id } = params
    const msgCache = await MsgCache.findOne({ _id: cache_id }).lean()
    if (!msgCache) {
      sendNewMsg(params)
    } else {
      updateMsg(params, msgCache)
    }
  } catch (error) {
    console.error(`[msg send error] `, error)
  }
}

const sendNewMsg = async (params) => {
  const { message, chat_id = CHAT_ID, message_thread_id, cache_id } = params
  const res = await fetcher(`api/tg/message`, 'POST', {
    message,
    chat_id,
    message_thread_id
  })
  await MsgCache.create({
    _id: cache_id,
    message,
    expireTs: getExpireTs(96),
    chat_id: [chat_id, message_thread_id].filter(i => !!i).join(':'),
    message_id: res.message_id
  })
}

const updateMsg = async (params, msgCache) => {
  const { message, cache_id } = params
  const [cached_chat_id, message_thread_id] = msgCache.chat_id.split(':')
  if (message !== msgCache.message) {
    await fetcher(`api/tg/message`, 'PUT', {
      message,
      chat_id: cached_chat_id,
      message_thread_id,
      message_id: msgCache.message_id
    })
    await MsgCache.updateOne({ _id: cache_id }, { message })
  }
}


const getExpireTs = (expireHours) => {
  return new Date().getTime() + 1000 * 60 * 60 * expireHours
}