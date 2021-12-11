import test from 'ava'

import { eventbridgeParser } from './eventbridge.js'

test('eventbridgeParser: parses single event', (t) => {
  const event = { foo: 'bar' }
  t.deepEqual(eventbridgeParser(event), [event])
})

test('eventbridgeParser: parses sqs event records', (t) => {
  const Records = [
    { body: '{"foo":1}', messageAttributes: {} },
    { body: '{"foo":2}', messageAttributes: {} }
  ]
  const events = [{ foo: 1 }, { foo: 2 }]
  const event = { Records }
  t.deepEqual(eventbridgeParser(event), events)
})

test('eventbridgeParser: parses sqs event records with request body', (t) => {
  const Records = [
    { body: '{"requestPayload":{"foo":1}}', messageAttributes: {} },
    { body: '{"requestPayload":{"foo":2}}', messageAttributes: {} }
  ]
  const events = [{ foo: 1 }, { foo: 2 }]
  const event = { Records }
  t.deepEqual(eventbridgeParser(event), events)
})
