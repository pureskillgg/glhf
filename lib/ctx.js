import { getRequestId } from './request-id.js'
import { discoverEventType } from './event.js'

export const createCtx = (event, context) => {
  const { awsRequestId, functionName, invokedFunctionArn } = context

  const eventType = discoverEventType(event, context)
  const reqId = getRequestId(eventType, event)
  const awsAccountId = getAwsAccontId(invokedFunctionArn)

  return {
    awsAccountId,
    awsRequestId,
    functionName,
    eventType,
    reqId
  }
}

const getAwsAccontId = (invokedFunctionArn) => {
  if (!invokedFunctionArn) return
  const arnParts = invokedFunctionArn.split(':')
  return arnParts[4]
}
