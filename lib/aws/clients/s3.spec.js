import test from 'ava'
import * as td from 'testdouble'
import { createLogger } from '@meltwater/mlabs-logger'

import { S3Client } from './s3.js'

test.beforeEach((t) => {
  t.context.S3 = td.constructor(['upload'])

  t.context.createClient = (t) => {
    const client = new S3Client({
      S3: t.context.S3,
      reqId,
      log: createLogger({ t })
    })

    return client
  }
})

test('constructor: passes functionName to AWS S3', (t) => {
  const { S3 } = t.context
  const bucket = 'some-bucket'
  const client = new S3Client({
    S3,
    bucket,
    log: createLogger({ t })
  })
  td.verify(new S3({ params: { Bucket: bucket } }))
  t.truthy(client)
})

test('constructor: passes params to AWS S3', (t) => {
  const { S3 } = t.context
  const bucket = 'some-bucket'
  const params = { foo: 'bar' }
  const client = new S3Client({
    S3,
    bucket,
    params,
    log: createLogger({ t })
  })
  td.verify(new S3({ params: { ...params, Bucket: bucket } }))
  t.truthy(client)
})

test('uploadJson: returns response', async (t) => {
  const { S3, createClient } = t.context
  const client = createClient(t)
  const promise = td.func()
  const res = Symbol('res')
  const key = 'some-key'
  const input = { foo: 2 }

  const Body = JSON.stringify(input)
  td.when(
    S3.prototype.upload({
      Key: key,
      Body,
      ContentType: 'application/json',
      Metadata: { 'request-id': reqId }
    })
  ).thenReturn({ promise })

  td.when(promise()).thenResolve(res)

  const data = await client.uploadJson(key, input)

  t.is(data, res)
})

test('uploadJson: passes params', async (t) => {
  const { S3, createClient } = t.context
  const client = createClient(t)
  const promise = td.func()
  const res = Symbol('res')
  const key = 'some-key'
  const input = { foo: 2 }

  const Body = JSON.stringify(input)
  td.when(
    S3.prototype.upload({
      Key: key,
      Body,
      ContentType: 'application/json',
      Bar: 2,
      Metadata: { 'request-id': reqId, baz: '5' }
    })
  ).thenReturn({ promise })

  td.when(promise()).thenResolve(res)

  const data = await client.uploadJson(key, input, {
    Bar: 2,
    Metadata: { baz: '5' }
  })

  t.is(data, res)
})

test('uploadJson: throws client error', async (t) => {
  const { S3, createClient } = t.context
  const client = createClient(t)
  const promise = td.func()
  const err = new Error('foo')

  td.when(S3.prototype.upload(td.matchers.anything())).thenReturn({
    promise
  })
  td.when(promise()).thenReject(err)

  await t.throwsAsync(() => client.uploadJson({}), { is: err })
})

const reqId = 'some-req-id'
