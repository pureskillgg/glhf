import test from 'ava'
import { createLogger } from '@meltwater/mlabs-logger'

import { createInvokeWrapper } from './invoke.js'

test('createInvokeWrapper', async (t) => {
  const log = createLogger({ t })
  const wrapper = createInvokeWrapper(log, strategy, parser, serializer)
  const data = await wrapper({ a: 1 }, { b: 2 })
  t.deepEqual(data, {
    bar: 'bar',
    ctx: { b: 2 },
    event: { a: 1, foo: 'foo' }
  })
})

const strategy = async (event, ctx) => ({ event, ctx })

const parser = (event) => ({ ...event, foo: 'foo' })

const serializer = (data) => ({ ...data, bar: 'bar' })
