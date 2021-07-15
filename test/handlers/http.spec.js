import test from 'ava'

import { httpHandler, httpJsonHandler, readJson } from '../../index.js'

test('httpHandler: invoke', async (t) => {
  const event = await readJson('fixtures', 'event', 'api-gateway-proxy.json')
  event.reqId = 'mock-req-id'
  const createHandler = httpHandler({ createProcessor })
  const handler = createHandler({}, t)
  const data = await handler(event)
  t.snapshot(data, 'handler')
})

test('httpJsonHandler: invoke', async (t) => {
  const event = await readJson('fixtures', 'event', 'api-gateway-proxy.json')
  event.reqId = 'mock-req-id'
  event.body = '{"a":1}'
  const createHandler = httpJsonHandler({ createProcessor })
  const handler = createHandler({}, t)
  const data = await handler(event)
  t.snapshot(data, 'handler')
})

const createProcessor = () => async (event, ctx) => ({ event, ctx })
