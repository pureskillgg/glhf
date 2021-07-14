import test from 'ava'
import { createLogger } from '@meltwater/mlabs-logger'
import { asValue, createContainer } from 'awilix'

import { createParallelStrategy } from './parallel.js'

test('createParallelStrategy', async (t) => {
  const container = createContainer()
  container.register('processor', asValue(processor))
  container.register('log', asValue(createLogger({ t })))
  container.register('reqId', asValue('mock-req-id'))
  const strategy = createParallelStrategy(container)
  const data = await strategy([{ a: 1 }, { a: 2 }], { b: 2 })
  t.deepEqual(data, [
    {
      event: { a: 1 },
      ctx: { b: 2 }
    },
    {
      event: { a: 2 },
      ctx: { b: 2 }
    }
  ])
})

const processor = async (event, ctx) => ({ event, ctx })
