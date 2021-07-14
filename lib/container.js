import {
  asFunction,
  asValue,
  createContainer as createAwilixContainer
} from 'awilix'

export const createContainer = (config, { ctx, log, createProcessor }) => {
  const container = createAwilixContainer()
  registerContext(container, { ctx, log })
  container.register('processor', asFunction(createProcessor).scoped())
  return container
}

export const registerContext = (container, { ctx, log }) => {
  const { reqId } = ctx

  container.register({
    reqId: asValue(reqId),
    log: asValue(log.child({ reqId, isAppLog: true }))
  })
}
