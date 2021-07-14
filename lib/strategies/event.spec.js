import test from 'ava'
import { asValue, createContainer } from 'awilix'

import { createEventStrategy } from './event.js'

test('createEventStrategy', async (t) => {
  const container = createContainer()
  container.register('processor', asValue(processor))
  const strategy = createEventStrategy(container)
  const data = await strategy({ a: 1 }, { b: 2 })
  t.deepEqual(data, {
    ctx: { b: 2 },
    event: { a: 1 }
  })
})

const processor = async (event, ctx) => ({ event, ctx })
