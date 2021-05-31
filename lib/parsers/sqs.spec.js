import test from 'ava'

import { sqsParser, sqsJsonParser } from './sqs.js'

test('sqsParser: parses event', (t) => {
  const Records = [
    { body: 'mock-body-1', messageAttributes: {} },
    { body: 'mock-body-2', messageAttributes: {} }
  ]
  const event = { Records }
  t.deepEqual(sqsParser(event), Records)
})

test('sqsParser: parses event when missing records', (t) => {
  const event = {}
  t.deepEqual(sqsParser(event), [])
})

test('sqsParser: parses message attributes', (t) => {
  const Records = [{ messageAttributes }, {}]
  const event = { Records }
  t.deepEqual(sqsParser(event), [
    { messageAttributes: parsedMessageAttributes },
    { messageAttributes: {} }
  ])
})

test('sqsJsonParser: parses event', (t) => {
  const Records = [
    { body: '{}', messageAttributes: {} },
    { body: '{"foo":2}', messageAttributes: {} }
  ]
  const event = { Records }
  t.deepEqual(sqsJsonParser(event), [
    { body: {}, messageAttributes: {} },
    { body: { foo: 2 }, messageAttributes: {} }
  ])
})

test('sqsJsonParser: parses event when missing records', (t) => {
  const event = {}
  t.deepEqual(sqsJsonParser(event), [])
})

test('sqsJsonParser: parses message attributes', (t) => {
  const Records = [
    {
      body: '{}',
      messageAttributes
    },
    { body: '{}' }
  ]

  const event = { Records }
  t.deepEqual(sqsJsonParser(event), [
    { body: {}, messageAttributes: parsedMessageAttributes },
    { body: {}, messageAttributes: {} }
  ])
})

const parsedMessageAttributes = {
  'req-id': 'mock-req-id',
  cost: 1.34
}

const messageAttributes = {
  'req-id': {
    dataType: 'String',
    stringValue: 'mock-req-id'
  },
  cost: {
    dataType: 'Number',
    stringValue: '1.34'
  }
}
