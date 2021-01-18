import test from 'ava'
import * as td from 'testdouble'
import { createLogger } from '@meltwater/mlabs-logger'

import { LambdaClient } from './lambda.js'

test.beforeEach((t) => {
  t.context.Lambda = td.constructor(['invoke'])

  t.context.createClient = (t) => {
    const client = new LambdaClient({
      Lambda: t.context.Lambda,
      reqId,
      log: createLogger({ t })
    })

    return client
  }
})

test('constructor: passes arn to AWS Lambda as FunctionName', (t) => {
  const { Lambda } = t.context
  const arn = 'some-arn'
  const client = new LambdaClient({ Lambda, arn, log: createLogger({ t }) })
  td.verify(new Lambda({ params: { FunctionName: arn } }))
  t.truthy(client)
})

test('invokeJson: returns parsed payload', async (t) => {
  const { Lambda, createClient } = t.context
  const client = createClient(t)
  const promise = td.func()
  const payload = { success: true }
  const input = { foo: 2 }

  const Payload = JSON.stringify({ ...input, reqId })
  td.when(Lambda.prototype.invoke({ Payload })).thenReturn({ promise })

  td.when(promise()).thenResolve({
    Payload: JSON.stringify(payload),
    StatusCode: 200
  })

  const data = await client.invokeJson(input)

  t.deepEqual(data, payload)
})

test('throws low status code error', async (t) => {
  const { Lambda, createClient } = t.context
  const client = createClient(t)
  const promise = td.func()
  const statusCode = 199

  td.when(Lambda.prototype.invoke(td.matchers.anything())).thenReturn({
    promise
  })
  td.when(promise()).thenResolve({ StatusCode: statusCode })

  const error = await t.throwsAsync(() => client.invokeJson({}), {
    message: /status code/i
  })

  t.like(error, { code: 'err_lambda_status_code', statusCode })
})

test('throws high status code error', async (t) => {
  const { Lambda, createClient } = t.context
  const client = createClient(t)
  const promise = td.func()
  const statusCode = 300

  td.when(Lambda.prototype.invoke(td.matchers.anything())).thenReturn({
    promise
  })
  td.when(promise()).thenResolve({ StatusCode: statusCode })

  const error = await t.throwsAsync(() => client.invokeJson({}), {
    message: /status code/i
  })

  t.like(error, { code: 'err_lambda_status_code', statusCode })
})

test('throws high function error', async (t) => {
  const { Lambda, createClient } = t.context
  const client = createClient(t)
  const promise = td.func()

  td.when(Lambda.prototype.invoke(td.matchers.anything())).thenReturn({
    promise
  })
  td.when(promise()).thenResolve({
    StatusCode: 200,
    FunctionError: 'Unhandled',
    Payload: JSON.stringify(errorPayload)
  })

  const error = await t.throwsAsync(() => client.invokeJson({}), {
    message: /ReferenceError/i
  })

  t.like(error, { code: 'err_lambda_function', data: errorPayload })
})

test('throws client error', async (t) => {
  const { Lambda, createClient } = t.context
  const client = createClient(t)
  const promise = td.func()
  const err = new Error('foo')

  td.when(Lambda.prototype.invoke(td.matchers.anything())).thenReturn({
    promise
  })
  td.when(promise()).thenReject(err)

  await t.throwsAsync(() => client.invokeJson({}), { is: err })
})

const errorPayload = {
  errorType: 'ReferenceError',
  errorMessage: 'x is not defined',
  trace: [
    'ReferenceError: x is not defined',
    '    at Runtime.exports.handler (/var/task/index.js:2:3)',
    '    at Runtime.handleOnce (/var/runtime/Runtime.js:63:25)',
    '    at process._tickCallback (internal/process/next_tick.js:68:7)'
  ]
}

const reqId = 'some-req-id'