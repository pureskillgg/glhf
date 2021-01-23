import { v4 as uuidv4 } from 'uuid'

export const getRequestId = (...args) => {
  const reqId = getRequestIdFromEvent(...args)
  return reqId || uuidv4()
}

const getRequestIdFromEvent = (eventType, event) => {
  if (eventType === 'lambda') return event.reqId
}
