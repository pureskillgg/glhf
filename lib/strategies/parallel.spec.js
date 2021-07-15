import test from 'ava'
import { createLogger } from '@meltwater/mlabs-logger'
import { asValue, createContainer } from 'awilix'

import { EventType } from '../event/index.js'

import { createParallelStrategy } from './parallel.js'

test('createParallelStrategy', async (t) => {
  const container = createContainer()
  container.register('processor', asValue(processor))
  container.register('log', asValue(createLogger({ t })))
  container.register('reqId', asValue('mock-req-id'))
  const strategy = createParallelStrategy(container)
  const data = await strategy(
    [
      { a: 1, reqId: 'mock-req-id-1' },
      { a: 2, reqId: 'mock-req-id-2' }
    ],
    { b: 2 }
  )
  t.deepEqual(data, [
    {
      event: { a: 1, reqId: 'mock-req-id-1' },
      ctx: { b: 2, reqId: 'mock-req-id-1', ...ctx }
    },
    {
      event: { a: 2, reqId: 'mock-req-id-2' },
      ctx: { b: 2, reqId: 'mock-req-id-2', ...ctx }
    }
  ])
})

test('createParallelStrategy: calls onError', async (t) => {
  t.plan(2)
  const onError = (err) => {
    t.is(err.message, errMessage)
  }
  const container = createContainer()
  container.register('processor', asValue(processorWithError))
  container.register('log', asValue(createLogger({ t })))
  container.register('reqId', asValue('mock-req-id'))
  container.register('onError', asValue(onError))
  const strategy = createParallelStrategy(container)
  await t.throwsAsync(
    () => strategy([{ a: 1, reqId: 'mock-req-id-1' }], { b: 2 }),
    { message: errMessage }
  )
})

const processor = async (event, ctx) => ({ event, ctx })

const errMessage = 'Mock processor error'
const processorWithError = async (event, ctx) => {
  throw new Error(errMessage)
}

const ctx = {
  eventType: EventType.lambda,
  awsRequestId: undefined,
  functionName: undefined
}
