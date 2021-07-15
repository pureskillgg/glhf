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

test('createHttpStrategy: calls onError', async (t) => {
  t.plan(2)
  const onError = (err) => {
    t.is(err.message, errMessage)
  }
  const container = createContainer()
  container.register('processor', asValue(processorWithError))
  container.register('onError', asValue(onError))
  const strategy = createEventStrategy(container)
  await t.throwsAsync(() => strategy({ a: 1 }, { b: 2 }), {
    message: errMessage
  })
})

const processor = async (event, ctx) => ({ event, ctx })

const errMessage = 'Mock processor error'
const processorWithError = async (event, ctx) => {
  throw new Error(errMessage)
}
