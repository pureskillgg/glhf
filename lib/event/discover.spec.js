import test from 'ava'

import { EventType } from './index.js'
import { discoverEventType } from './discover.js'

test('discoverEventType: lambda', (t) => {
  t.is(discoverEventType({}), EventType.lambda)
})
