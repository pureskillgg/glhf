import test from 'ava'

import { EventType } from './event/index.js'
import { getRequestId } from './request-id.js'

test('getRequestId: lambda', (t) => {
  t.is(getRequestId(EventType.lambda, { reqId }), reqId, 'existing')
  t.truthy(getRequestId(EventType.lambda, {}), 'new')
})

test('getRequestId: sqs', (t) => {
  t.is(
    getRequestId(EventType.sqs, { messageAttributes: { 'req-id': reqId } }),
    reqId,
    'existing'
  )
  t.truthy(getRequestId(EventType.sqs, {}), 'new')
})

const reqId = 'mock-req-id'
