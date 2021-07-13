import { EventType } from './index.js'

export const discoverEventType = (event, context) => {
  if (event.eventSource === 'aws:sqs') return EventType.sqs
  return EventType.lambda
}
