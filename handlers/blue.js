import Sentry from '@sentry/serverless'
import { asFunction, asValue } from 'awilix'
import { envString } from '@pureskillgg/ace'

import { invokeHandler } from '../index.js'

Sentry.AWSLambda.init()

const createInit =
  ({ cache }) =>
  async () => {
    cache.isInit = true
  }

const registerDependencies = (container, config) => {
  container.register({ rank: asValue(config.rank) })
  container.register({
    cache: asValue({}),
    init: asFunction(createInit).singleton()
  })
}

const parameters = {
  rank: envString('RANK')
}

const createProcessor =
  ({ rank, cache }) =>
  async (event, ctx) => {
    return { ...event, rank, isInit: cache.isInit }
  }

export const createHandler = invokeHandler({
  registerDependencies,
  createProcessor
})

export const handler = Sentry.AWSLambda.wrapHandler(
  await createHandler(parameters)
)
