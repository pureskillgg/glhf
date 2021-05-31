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

const parseMessageAttribute = (messageAttribute) => messageAttribute.stringValue

const parseJsonRecord = (record) => ({
  ...record,
  body: JSON.parse(record.body)
})
