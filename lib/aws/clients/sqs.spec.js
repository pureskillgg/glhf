import test from 'ava'
import * as td from 'testdouble'
import { createLogger } from '@meltwater/mlabs-logger'

import { SqsClient } from './sqs.js'

test.beforeEach((t) => {
  t.context.SQS = td.constructor(['sendMessage'])

  t.context.createClient = (t) => {
    const client = new SqsClient({
      SQS: t.context.SQS,
      reqId,
      log: createLogger({ t })
    })

    return client
  }
})

test('constructor: passes queueUrl to AWS SQS', (t) => {
  const { SQS } = t.context
  const queueUrl = 'some-queue-url'
  const client = new SqsClient({
    SQS,
    queueUrl,
    log: createLogger({ t })
  })
  td.verify(new SQS({ params: { QueueUrl: queueUrl } }))
  t.truthy(client)
})

test('constructor: passes params to AWS SQS', (t) => {
  const { SQS } = t.context
  const queueUrl = 'some-queue-url'
  const params = { foo: 'bar' }
  const client = new SqsClient({
    SQS,
    queueUrl,
    params,
    log: createLogger({ t })
  })
  td.verify(new SQS({ params: { ...params, QueueUrl: queueUrl } }))
  t.truthy(client)
})

test('sendMessageJson: returns response', async (t) => {
  const { SQS, createClient } = t.context
  const client = createClient(t)
  const promise = td.func()
  const input = { foo: 2 }

  const MessageBody = JSON.stringify(input)
  td.when(
    SQS.prototype.sendMessage({
      MessageBody,
      MessageAttributes: { reqId: { DataType: 'String', StringValue: reqId } }
    })
  ).thenReturn({ promise })

  td.when(promise()).thenResolve(messageReceipt)

  const data = await client.sendMessageJson(input)

  t.deepEqual(data, formattedMessageReceipt)
})

test('sendMessageJson: passes params', async (t) => {
  const { SQS, createClient } = t.context
  const client = createClient(t)
  const promise = td.func()
  const input = { foo: 2 }

  const MessageBody = JSON.stringify(input)
  td.when(
    SQS.prototype.sendMessage({
      MessageBody,
      MessageAttributes: {
        reqId: { DataType: 'String', StringValue: reqId },
        baz: { DataType: 'String', StringValue: '4' }
      },
      Bar: 3
    })
  ).thenReturn({ promise })

  td.when(promise()).thenResolve(messageReceipt)

  const data = await client.sendMessageJson(input, {
    Bar: 3,
    MessageAttributes: { baz: { DataType: 'String', StringValue: '4' } }
  })

  t.deepEqual(data, formattedMessageReceipt)
})

test('sendMessageJson: throws client error', async (t) => {
  const { SQS, createClient } = t.context
  const client = createClient(t)
  const promise = td.func()
  const err = new Error('foo')

  td.when(SQS.prototype.sendMessage(td.matchers.anything())).thenReturn({
    promise
  })
  td.when(promise()).thenReject(err)

  await t.throwsAsync(() => client.sendMessageJson({}), { is: err })
})

const reqId = 'some-req-id'

const messageReceipt = {
  MD5OfMessageBody: 'some-md5-of-message-body',
  MD5OfMessageAttributes: 'some-md5-of-message-attributes',
  MD5OfMessageSystemAttributes: 'some-md5-of-message-system-attributes',
  MessageId: 'some-message-id',
  SequenceNumber: 'some-sequence-number'
}

const formattedMessageReceipt = {
  md5OfMessageBody: 'some-md5-of-message-body',
  md5OfMessageAttributes: 'some-md5-of-message-attributes',
  md5OfMessageSystemAttributes: 'some-md5-of-message-system-attributes',
  messageId: 'some-message-id',
  sequenceNumber: 'some-sequence-number'
}
