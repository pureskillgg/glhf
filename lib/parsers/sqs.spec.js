import test from 'ava'

import { sqsJsonParser, sqsParser } from './sqs.js'

test('sqsParser: parses event', (t) => {
  const Records = [
    { body: 'mock-body-1', attributes: {}, messageAttributes: {} },
    { body: 'mock-body-2', attributes: {}, messageAttributes: {} }
  ]
  const event = { Records }
  t.deepEqual(sqsParser(event), Records)
})

test('sqsParser: parses event when missing records', (t) => {
  const event = {}
  t.deepEqual(sqsParser(event), [])
})

test('sqsParser: parses attributes', (t) => {
  const Records = [{ attributes }, {}]

  const event = { Records }
  t.deepEqual(sqsParser(event), [
    { attributes: parsedAttributes, messageAttributes: {} },
    { attributes: {}, messageAttributes: {} }
  ])
})

test('sqsParser: parses message attributes', (t) => {
  const Records = [{ messageAttributes }, {}]
  const event = { Records }
  t.deepEqual(sqsParser(event), [
    { attributes: {}, messageAttributes: parsedMessageAttributes },
    { attributes: {}, messageAttributes: {} }
  ])
})

test('sqsJsonParser: parses event', (t) => {
  const Records = [
    { body: '{}', messageAttributes: {} },
    { body: '{"foo":2}', messageAttributes: {} }
  ]
  const event = { Records }
  t.deepEqual(sqsJsonParser(event), [
    { body: {}, attributes: {}, messageAttributes: {} },
    { body: { foo: 2 }, attributes: {}, messageAttributes: {} }
  ])
})

test('sqsJsonParser: parses event when missing records', (t) => {
  const event = {}
  t.deepEqual(sqsJsonParser(event), [])
})

test('sqsJsonParser: parses attributes', (t) => {
  const Records = [
    {
      body: '{}',
      attributes
    },
    { body: '{}' }
  ]

  const event = { Records }
  t.deepEqual(sqsJsonParser(event), [
    { body: {}, attributes: parsedAttributes, messageAttributes: {} },
    { body: {}, attributes: {}, messageAttributes: {} }
  ])
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
    { body: {}, attributes: {}, messageAttributes: parsedMessageAttributes },
    { body: {}, attributes: {}, messageAttributes: {} }
  ])
})

const attributes = {
  ApproximateReceiveCount: '1',
  SentTimestamp: '1545082649183',
  SenderId: 'AIDAIENQZJOLO23YVJ4VO',
  ApproximateFirstReceiveTimestamp: '1545082649185'
}

const parsedAttributes = {
  ApproximateReceiveCount: 1,
  SentTimestamp: 1545082649183,
  SenderId: 'AIDAIENQZJOLO23YVJ4VO',
  ApproximateFirstReceiveTimestamp: 1545082649185
}

const parsedMessageAttributes = {
  'req-id': 'mock-req-id',
  cost: 1.34,
  img: Buffer.from('abc')
}

const messageAttributes = {
  'req-id': {
    dataType: 'String',
    stringValue: 'mock-req-id'
  },
  cost: {
    dataType: 'Number',
    stringValue: '1.34'
  },
  img: {
    dataType: 'Binary',
    binaryValue: 'YWJj'
  }
}
