import { asValue } from 'awilix'
import { invokeHandler } from '../index.js'
import { localString } from '@pureskillgg/ace'

const registerDependencies = (container, config) => {
  container.register({ rank: asValue(config.rank) })
}

const parameters = {
  rank: localString('RANK')
}

const createProcessor = ({ rank }) => async (event, container) => {
  return { ...event, rank }
}

export const createHandleInvoke = invokeHandler({
  registerDependencies,
  createProcessor
})

export const handler = createHandleInvoke(parameters)
