import test from 'ava'
import { localString } from '@pureskillgg/ace'

import { createHandleInvoke } from '../../handlers/blue.mjs'

test('invoke', async (t) => {
  const event = { foo: 'bar' }
  const handler = createHandleInvoke(parameters, localParameters, t)
  const data = await handler(event)
  t.snapshot(data, 'handler')
})

const parameters = {
  rank: localString('rank')
}

const localParameters = {
  rank: 'mock-rank'
}
