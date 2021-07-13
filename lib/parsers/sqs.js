import { map } from '@meltwater/phi'

export const sqsParser = (event) => {
  const { Records = [] } = event
  return Records.map(parseRecord)
}

export const sqsJsonParser = (event) => sqsParser(event).map(parseJsonRecord)

const parseRecord = (record) => ({
  ...record,
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