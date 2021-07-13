import { v4 as uuidv4 } from 'uuid'

import { EventType } from './event/index.js'

export const getRequestId = (...args) => {
  const reqId = getRequestIdFromEvent(...args)
  return reqId || uuidv4()
}

const getRequestIdFromEvent = (eventType, event) => {
  if (eventType === EventType.lambda) return event.reqId
}
