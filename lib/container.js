import { asFunction, asValue, createContainer } from 'awilix'

import { getRequestId } from './request-id.js'
import { createGlobalCtx } from './ctx.js'
import { createLogger } from './logger.js'

export const createDependencies = (env, t) => {
  const container = createContainer()
  const ctx = createGlobalCtx(env)
  const log = createLogger(ctx, t)
  const reqId = getRequestId()
  const init = async () => {}

  container.register({
    init: asValue(init),
    reqId: asValue(reqId),
    log: asValue(log.child({ reqId, isAppLog: false }))
  })

  return container
}

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
