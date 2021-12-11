import { isArray, isNotNil } from '@meltwater/phi'

import { sqsJsonParser } from './sqs.js'

export const eventbridgeParser = (event) => {
  const records = getRecords(event)
  return records.map(getEvent)
}

const getEvent = (record) =>
  isNotNil(record.requestPayload) ? record.requestPayload : record

const getRecords = (event) => {
  if (isArray(event?.Records)) {
    return sqsJsonParser(event).map(({ body }) => body)
  }
  return [event]
}
