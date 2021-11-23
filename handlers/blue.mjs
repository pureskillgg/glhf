import { asValue } from 'awilix'
import { envString } from '@pureskillgg/ace'

import { invokeHandler } from '../index.js'

const registerDependencies = (container, config) => {
  container.register({ rank: asValue(config.rank) })
}

const parameters = {
  rank: envString('RANK')
}

const createProcessor =
  ({ rank }) =>
  async (event, ctx) => {
    return { ...event, rank }
  }

export const createHandler = invokeHandler({
  registerDependencies,
  createProcessor
})

export const handler = createHandler(parameters)
