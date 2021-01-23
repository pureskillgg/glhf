export const createCtx = (event, context) => {
  const { awsRequestId, functionName } = context

  const eventType = 'TODO'
  const reqId = 'TODO'

  return {
    awsRequestId,
    functionName,
    eventType,
    reqId
  }
}
