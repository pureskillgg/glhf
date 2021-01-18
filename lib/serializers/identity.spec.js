import test from 'ava'

import { identitySerializer } from './identity.js'

test('identitySerializer: acts as identity', (t) => {
  const data = { foo: 'bar' }
  t.is(identitySerializer(data), data)
})
