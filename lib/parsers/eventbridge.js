import { isArray } from '@meltwater/phi'

import { sqsJsonParser } from './sqs.js'

export const eventbridgeParser = (event) => {
  if (isArray(event?.Records)) {
    const data = sqsJsonParser(event)
    return data.map(({ body }) => body)
  }
  return [event]
}
