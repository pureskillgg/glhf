import test from 'ava'

import {
  apiGatewayProxyJsonSerializer,
  apiGatewayProxySerializer
} from './api-gateway-proxy.js'

test('apiGatewayProxySerializer: serializes', (t) => {
  const data = { foo: 'bar', statusCode: 201 }
  t.deepEqual(apiGatewayProxySerializer(data), data)
})

test('apiGatewayProxySerializer: adds default status code', (t) => {
  const data = { foo: 'bar' }
  t.deepEqual(apiGatewayProxySerializer(data), { ...data, statusCode: 200 })
})

test('apiGatewayProxyJsonSerializer: serializes data', (t) => {
  const data = { foo: 'bar', statusCode: 201 }
  t.deepEqual(apiGatewayProxyJsonSerializer(data), { ...data, body: undefined })
})

test('apiGatewayProxyJsonSerializer: adds default status code', (t) => {
  const data = { foo: 'bar' }
  t.deepEqual(apiGatewayProxyJsonSerializer(data), {
    ...data,
    body: undefined,
    statusCode: 200
  })
})

test('apiGatewayProxyJsonSerializer: serializes body as json', (t) => {
  const data = { foo: 'bar', body: { a: 2 } }
  t.deepEqual(apiGatewayProxyJsonSerializer(data), {
    ...data,
    body: '{"a":2}',
    statusCode: 200
  })
})
