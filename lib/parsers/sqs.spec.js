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
  const messageAttributes = {
    'req-id': 'mock-req-id'
  }

  const Records = [
    {
      messageAttributes: {
        'req-id': {
          dataType: 'String',
          stringValue: 'mock-req-id'
        }
      }
    }
  ]

  const event = { Records }
  t.deepEqual(sqsParser(event), [{ messageAttributes }])
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
  const messageAttributes = {
    'req-id': 'mock-req-id'
  }

  const Records = [
    {
      body: '{}',
      messageAttributes: {
        'req-id': {
          dataType: 'String',
          stringValue: 'mock-req-id'
        }
      }
    }
  ]

  const event = { Records }
  t.deepEqual(sqsJsonParser(event), [{ body: {}, messageAttributes }])
})
