import test from 'ava'
import { asValue } from 'awilix'

import { createHandler } from '../../handlers/red.js'

test('invoke', async (t) => {
  const event = { foo: 'bar' }

  const blueLambdaClient = {
    invokeJson: async (...args) => {
      t.snapshot(args, 'blueLambdaClient.invokeJson')
      return { foo: 'baz' }
    }
  }

  const overrideDependencies = (container) => {
    container.register('blueLambdaClient', asValue(blueLambdaClient))
  }

  const handler = createHandler({}, t, overrideDependencies)
  const data = await handler(event)
  t.snapshot(data, 'handler')
})
