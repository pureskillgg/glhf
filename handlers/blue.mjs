import { asValue } from 'awilix'
import { invokeHandler } from '../index.js'
import { envString } from '@pureskillgg/ace'

const registerDependencies = (container, config) => {
  container.register({ rank: asValue(config.rank) })
}

const parameters = {
  rank: envString('RANK')
}

const createProcessor = ({ rank }) => async (event, ctx) => {
  return { ...event, rank }
}

export const createHandleInvoke = invokeHandler({
  registerDependencies,
  createProcessor
})

export const handler = createHandleInvoke(parameters)
