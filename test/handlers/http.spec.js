import test from 'ava'
import { unauthorized } from '@hapi/boom'

import { httpHandler, httpJsonHandler, readJson } from '../../index.js'

test('httpHandler: invoke', async (t) => {
  const event = await readJson('fixtures', 'event', 'api-gateway-proxy.json')
  event.reqId = 'mock-req-id'
  const createHandler = httpHandler({ createProcessor })
  const handler = await createHandler({}, t)
  const data = await handler(event)
  t.snapshot(data, 'handler')
})

test('httpHandler: handle error', async (t) => {
  const event = await readJson('fixtures', 'event', 'api-gateway-proxy.json')
  event.reqId = 'mock-req-id'
  const createHandler = httpHandler({
    createProcessor: createProcessorWithError
  })
  const handler = await createHandler({}, t)
  const data = await handler(event)
  t.snapshot(data, 'handler')
})

test('httpHandler: handle boom error', async (t) => {
  const event = await readJson('fixtures', 'event', 'api-gateway-proxy.json')
  event.reqId = 'mock-req-id'
  const createHandler = httpHandler({
    createProcessor: createProcessorWithBoomError
  })
  const handler = await createHandler({}, t)
  const data = await handler(event)
  t.snapshot(data, 'handler')
})

test('httpJsonHandler: invoke', async (t) => {
  const event = await readJson('fixtures', 'event', 'api-gateway-proxy.json')
  event.reqId = 'mock-req-id'
  event.body = '{"a":1}'
  const createHandler = httpJsonHandler({ createProcessor })
  const handler = await createHandler({}, t)
  const data = await handler(event)
  t.snapshot(data, 'handler')
})

test('httpJsonHandler: handle error', async (t) => {
  const event = await readJson('fixtures', 'event', 'api-gateway-proxy.json')
  event.reqId = 'mock-req-id'
  event.body = '{"a":1}'
  const createHandler = httpHandler({
    createProcessor: createProcessorWithError
  })
  const handler = await createHandler({}, t)
  const data = await handler(event)
  t.snapshot(data, 'handler')
})

test('httpJsonHandler: handle boom error', async (t) => {
  const event = await readJson('fixtures', 'event', 'api-gateway-proxy.json')
  event.reqId = 'mock-req-id'
  event.body = '{"a":1}'
  const createHandler = httpJsonHandler({
    createProcessor: createProcessorWithBoomError
  })
  const handler = await createHandler({}, t)
  const data = await handler(event)
  t.snapshot(data, 'handler')
})

const createProcessor = () => async (event, ctx) => ({ event, ctx })

const createProcessorWithError = () => async (event, ctx) => {
  throw new Error('Mock processor error')
}

const createProcessorWithBoomError = () => async (event, ctx) => {
  throw unauthorized()
}
