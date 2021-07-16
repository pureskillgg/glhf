import test from 'ava'

import {
  apiGatewayProxyJsonSerializer,
  apiGatewayProxySerializer
} from './api-gateway-proxy.js'

test('apiGatewayProxySerializer: serializes', (t) => {
  const data = { foo: 'bar', statusCode: 201 }
  t.deepEqual(apiGatewayProxySerializer(data), data)
})

test('apiGatewayProxyJsonSerializer: serializes data', (t) => {
  const data = { foo: 'bar', statusCode: 201 }
  t.deepEqual(apiGatewayProxyJsonSerializer(data), data)
})

test('apiGatewayProxyJsonSerializer: serializes body as json', (t) => {
  const data = { foo: 'bar', headers: { x: 'y' }, body: { a: 2 } }
  t.deepEqual(apiGatewayProxyJsonSerializer(data), {
    ...data,
    isBase64Encoded: false,
    cookies: [],
    statusCode: 200,
    body: '{"a":2}',
    headers: {
      x: 'y',
      'content-type': 'application/json'
    }
  })
})
