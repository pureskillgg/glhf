import test from 'ava'
import { localString } from '@pureskillgg/ace'

import { createHandler } from '../../handlers/blue.js'

test('invoke', async (t) => {
  const event = { foo: 'bar' }
  const handler = createHandler(parameters, t)
  const data = await handler(event)
  t.snapshot(data, 'handler')
})

const parameters = {
  rank: localString('rank', 'mock-rank')
}
