import test from 'ava'

import { createHandleInvoke } from '../../handlers/blue.js'

test('invoke', async (t) => {
  const event = { foo: 'bar' }
  const handler = createHandleInvoke([], t)
  const data = await handler(event, {})
  t.snapshot(data, 'handler')
})
