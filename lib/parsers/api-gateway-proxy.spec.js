import test from 'ava'

import {
  apiGatewayProxyJsonParser,
  apiGatewayProxyParser
} from './api-gateway-proxy.js'

test('apiGatewayProxyParser: parses event', (t) => {
  const version = '2.0'
  const event = { version }
  t.deepEqual(apiGatewayProxyParser(event), {
    version,
    searchParams: new URLSearchParams('')
  })
})

test('apiGatewayProxyParser: only parses event version 2.0', (t) => {
  const version = '1.0'
  const event = { version }
  t.throws(() => apiGatewayProxyParser(event), { message: /version 1.0/ })
})

test('apiGatewayProxyParser: parses event with search params', (t) => {
  const version = '2.0'
  const rawQueryString = 'foo=bar'
  const event = { version, rawQueryString }
  const data = apiGatewayProxyParser(event)
  t.is(data.searchParams.get('foo'), 'bar')
})

test('apiGatewayProxyJsonParser: parses event', (t) => {
  const version = '2.0'
  const event = { version }
  t.deepEqual(apiGatewayProxyJsonParser(event), {
    version,
    body: undefined,
    searchParams: new URLSearchParams('')
  })
})

test('apiGatewayProxyJsonParser: only parses event version 2.0', (t) => {
  const version = '1.0'
  const event = { version }
  t.throws(() => apiGatewayProxyJsonParser(event), {
    message: /version 1.0/
  })
})

test('apiGatewayProxyJsonParser: parses event with search params', (t) => {
  const version = '2.0'
  const rawQueryString = 'foo=bar'
  const event = { version, rawQueryString }
  const data = apiGatewayProxyJsonParser(event)
  t.is(data.searchParams.get('foo'), 'bar')
})

test('apiGatewayProxyJsonParser: parses event body as json', (t) => {
  const event = { version: '2.0', body: '{"foo":2}' }
  const data = apiGatewayProxyJsonParser(event)
  t.deepEqual(data.body, { foo: 2 })
})
