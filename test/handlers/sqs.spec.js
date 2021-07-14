import test from 'ava'

import { readJson, sqsHandler, sqsJsonHandler } from '../../index.js'

test('sqsHandler: invoke', async (t) => {
  const event = await readJson('fixtures', 'event', 'sqs.json')
  event.reqId = 'mock-req-id'
  const createHandler = sqsHandler({ createProcessor })
  const handler = createHandler({}, t)
  const data = await handler(event)
  t.snapshot(data, 'handler')
})

test('sqsJsonHandler: invoke', async (t) => {
  const event = await readJson('fixtures', 'event', 'sqs.json')
  event.reqId = 'mock-req-id'
  const createHandler = sqsJsonHandler({ createProcessor })
  const handler = createHandler({}, t)
  const data = await handler(event)
  t.snapshot(data, 'handler')
})

const createProcessor = () => async (event, ctx) => ({ event, ctx })
