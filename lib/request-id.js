import { v4 as uuidv4 } from 'uuid'
import { isNil, isNonEmptyString } from '@meltwater/phi'

import { EventType } from './event/index.js'

export const getRequestId = (...args) => {
  const reqId = getRequestIdFromEvent(...args)
  return reqId || uuidv4()
}

const getRequestIdFromEvent = (eventType, event) => {
  if (eventType === EventType.sqs) return getRequestIdFromSqsEvent(event)
  if (eventType === EventType.lambda) return event.reqId
}

const getRequestIdFromSqsEvent = (event) => {
  const reqIdAttribute = event.messageAttributes?.['req-id']
  if (isNonEmptyString(reqIdAttribute)) return reqIdAttribute
  if (isNil(reqIdAttribute)) return
  if (reqIdAttribute?.dataType === 'String') return reqIdAttribute.stringValue
}
