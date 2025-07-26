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

export const sendMsg = async (params) => {
  try {
    const { cacheId } = params
    const msgCache = await MsgCache.findOne({ _id: cacheId }).lean()
    if (!msgCache) {
      sendNewMsg(params)
    } else {
      !!msgCache.message && updateMsg(params, msgCache)
    }
  } catch (error) {
    console.error(`[msg send error] `, error)
  }
}

const sendNewMsg = async (params) => {
  const { message, cacheId } = params
  let chatId = params.chatId
  let messageThreadId = params.messageThreadId
  if (!chatId) {
    const [chat_id, message_thread_id] = CHAT_ID.split(':')
    chatId = chat_id
    messageThreadId = message_thread_id
  }
  try {
    await MsgCache.create({
      _id: cacheId,
      message,
      expireTs: getExpireTs(96),
      chatId: [chatId, messageThreadId].filter(i => !!i).join(':'),
    })
  } catch (error) {
    console.error(`[msg write db error] `, error)
    return
  }
  try {
    const res = await sendMsgAPI({
      message,
      chat_id: chatId,
      message_thread_id: messageThreadId
    })
    await MsgCache.updateOne({ _id: cacheId }, { messageId: res.message_id })
  } catch (error) {
    await MsgCache.deleteOne({ _id: cacheId })
  }
}

const updateMsg = async (params, msgCache) => {
  const { message, cacheId } = params
  const [cachedChatId, messageThreadId] = msgCache.chatId.split(':')
  if (message !== msgCache.message) {
    await fetcher(`api/tg/message`, 'PUT', {
      message,
      chat_id: cachedChatId,
      message_thread_id: messageThreadId,
      message_id: msgCache.messageId
    })
    await MsgCache.updateOne({ _id: cacheId }, { message })
  }
}

export const sendMsgAPI = async (params) => {
  const res = await fetcher(`api/tg/message`, 'POST', params)
  return res
}


const getExpireTs = (expireHours) => {
  return new Date().getTime() + 1000 * 60 * 60 * expireHours
}