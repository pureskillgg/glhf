import test from 'ava'

import { identityParser } from './identity.js'

test('identityParser: acts as identity', (t) => {
  const event = { foo: 'bar' }
  t.is(identityParser(event), event)
})
