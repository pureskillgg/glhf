import test from 'ava'
import { createLogger } from '@meltwater/mlabs-logger'
import { asValue, createContainer } from 'awilix'
import { unauthorized } from '@hapi/boom'

import { createHttpStrategy } from './http.js'

test('createHttpStrategy', async (t) => {
  const container = createContainer()
  container.register('processor', asValue(processor))
  container.register('log', asValue(createLogger({ t })))
  const strategy = createHttpStrategy(container)
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
  container.register('log', asValue(createLogger({ t })))
  const strategy = createHttpStrategy(container)
  const data = await strategy({ a: 1 }, { b: 2 })
  t.deepEqual(data, { statusCode: 500 })
})

test('createHttpStrategy: handles boom error', async (t) => {
  const container = createContainer()
  container.register('processor', asValue(processorWithBoomError))
  container.register('log', asValue(createLogger({ t })))
  const strategy = createHttpStrategy(container)
  const data = await strategy({ a: 1 }, { b: 2 })
  t.deepEqual(data, { statusCode: 401 })
})

const processor = async (event, ctx) => ({ event, ctx })

const errMessage = 'Mock processor error'
const processorWithError = async (event, ctx) => {
  throw new Error(errMessage)
}

const processorWithBoomError = async (event, ctx) => {
  throw unauthorized()
}
