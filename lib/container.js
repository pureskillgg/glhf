import {
  asFunction,
  asValue,
  createContainer as createAwilixContainer
} from 'awilix'

export const createContainer = (config, { ctx, log, createProcessor }) => {
  const container = createAwilixContainer()

  container.register({
    reqId: asValue(ctx.reqId),
    log: asValue(log.child({ isAppLog: true }))
  })

  container.register('processor', asFunction(createProcessor).scoped())

  return container
}
