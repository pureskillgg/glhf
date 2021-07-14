import test from 'ava'

import { EventType } from './event/index.js'
import { getRequestId } from './request-id.js'

test('getRequestId: lambda', (t) => {
  t.is(getRequestId(EventType.lambda, { reqId }), reqId, 'existing')
  t.truthy(getRequestId(EventType.lambda, {}), 'new')
})

test('getRequestId: sqs (parsed)', (t) => {
  t.is(
    getRequestId(EventType.sqs, { messageAttributes: { 'req-id': reqId } }),
    reqId,
    'existing'
  )
  t.truthy(getRequestId(EventType.sqs, { messageAttributes: {} }), 'new')
})

test('getRequestId: sqs (unparsed)', (t) => {
  t.is(
    getRequestId(EventType.sqs, {
      messageAttributes: {
        'req-id': { dataType: 'String', stringValue: reqId }
      }
    }),
    reqId,
    'existing'
  )
  t.truthy(getRequestId(EventType.sqs, { messageAttributes: {} }), 'new')
  t.truthy(
    getRequestId(EventType.sqs, {
      messageAttributes: { 'req-id': { dataType: 'Number' } }
    }),
    'new'
  )
})

const reqId = 'mock-req-id'
