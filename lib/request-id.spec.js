import test from 'ava'

import { EventType } from './event/index.js'
import { getRequestId } from './request-id.js'

test('getRequestId: lambda', (t) => {
  t.is(getRequestId(EventType.lambda, { reqId }), reqId)
})

const reqId = 'mock-req-id'
