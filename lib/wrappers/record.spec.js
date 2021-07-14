import test from 'ava'
import { createLogger } from '@meltwater/mlabs-logger'

import { createRecordWrapper } from './record.js'

test('createRecordWrapper', async (t) => {
  const log = createLogger({ t })
  const wrapper = createRecordWrapper(log, strategy)
  const data = await wrapper({ a: 1 }, { b: 2 })
  t.deepEqual(data, {
    event: { a: 1 },
    ctx: { b: 2 }
  })
})

const strategy = async (event, ctx) => ({ event, ctx })
