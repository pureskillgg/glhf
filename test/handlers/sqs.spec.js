import test from 'ava'

import { sqsHandler, sqsJsonHandler, readJson } from '../../index.js'

test('sqsHandler: invoke', async (t) => {
  const event = await readJson('fixtures', 'event', 'sqs.json')
  const createHandler = sqsHandler({ createProcessor })
  const handler = createHandler({}, t)
  const data = await handler(event)
  t.snapshot(data, 'handler')
})

test('sqsJsonHandler: invoke', async (t) => {
  const event = await readJson('fixtures', 'event', 'sqs.json')
  const createHandler = sqsJsonHandler({ createProcessor })
  const handler = createHandler({}, t)
  const data = await handler(event)
  t.snapshot(data, 'handler')
})

const createProcessor = () => async (event, context) => ({ event, context })
