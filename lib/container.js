import { asFunction, asValue } from 'awilix'

export { createContainer } from 'awilix'

export const createScope = (container, { ctx, log, createProcessor }) => {
  const scope = container.createScope()
  registerContext(scope, { ctx, log })
  scope.register('processor', asFunction(createProcessor).scoped())
  return scope
}

export const registerContext = (container, { ctx, log }) => {
  const { reqId } = ctx

  container.register({
    reqId: asValue(reqId),
    log: asValue(log.child({ reqId, isAppLog: true }))
  })
}
