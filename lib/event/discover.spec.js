import test from 'ava'

import { discoverEventType } from './discover.js'

import { EventType } from './index.js'

test('discoverEventType: lambda', (t) => {
  t.is(discoverEventType({}), EventType.lambda)
})

test('discoverEventType: sqs', (t) => {
  t.is(discoverEventType({ eventSource: 'aws:sqs' }), EventType.sqs, 'match')
  t.is(
    discoverEventType({ eventSource: 'aws:not-sqs' }),
    EventType.lambda,
    'no match'
  )
})
