import { evolve, map } from '@meltwater/phi'

import { recordsParser } from './records.js'

export const sqsParser = (event) => recordsParser(event).map(parseRecord)

export const sqsJsonParser = (event) => sqsParser(event).map(parseJsonRecord)

const parseRecord = (record) => ({
  ...record,
  attributes: parseAttributes(record.attributes ?? {}),
  messageAttributes: map(parseMessageAttribute, record.messageAttributes ?? {})
})

const parseMessageAttribute = ({ binaryValue, stringValue, dataType }) => {
  if (dataType === 'String') return stringValue
  if (dataType === 'Number') return Number(stringValue)
  if (dataType === 'Binary') return Buffer.from(binaryValue, 'base64')
  return stringValue
}

const parseJsonRecord = (record) => ({
  ...record,
  body: JSON.parse(record.body)
})

const parseAttributes = evolve({
  ApproximateReceiveCount: Number,
  SentTimestamp: Number,
  ApproximateFirstReceiveTimestamp: Number
})
