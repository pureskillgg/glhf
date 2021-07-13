import { getRequestId } from './request-id.js'
import { discoverEventType } from './event/discover.js'

export const createCtx = (event, context) => {
  const { awsRequestId, functionName } = context

  const eventType = discoverEventType(event)
  const reqId = getRequestId(eventType, event)

  return {
    awsRequestId,
    functionName,
    eventType,
    reqId
  }
}
