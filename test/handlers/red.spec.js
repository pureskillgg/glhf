import test from 'ava'

import { createHandleInvoke } from '../../handlers/red.js'

test('invoke', async (t) => {
  const event = { foo: 'bar' }
  const handler = createHandleInvoke()
  const data = await handler(event)
  t.snapshot(data)
})
