import { createLogger, logFatal } from '../logger.js'
import { identityParser } from '../parsers/index.js'
import { identitySerializer } from '../serializers/index.js'
import { createInvokeWrapper } from '../wrappers/index.js'
import { createEventStrategy } from '../strategies/index.js'
import { createDependencies, createScope } from '../container.js'
import { createCache } from '../cache.js'
import { getConfig } from '../config.js'
import { createCtx } from '../ctx.js'

const env = { ...process.env }

export const createHandler =
  ({
    parser = identityParser,
    serializer = identitySerializer,
    createProcessor = createNullProcessor,
    registerDependencies = registerEmptyDependencies,
    createWrapper = createInvokeWrapper,
    createStrategy = createEventStrategy,
    logOptions = {}
  }) =>
  async (parameters, t, overrideDependencies = registerEmptyDependencies) => {
    if (process.env.NODE_ENV === 'test' && !t) return async () => {}

    const cache = createCache()
    const container = createDependencies(env, t)

    const config = await getConfig({
      parameters,
      cache,
      aliases: t ? undefined : env,
      log: container.resolve('log')
    })

    registerDependencies(container, config)
    overrideDependencies(container, config)

    const init = container.resolve('init')
    await init()

    return async (event, context = {}) => {
      try {
        const ctx = createCtx(event, context)
        const log = createLogger(ctx, t, logOptions)
        const scope = createScope(container, { ctx, log, createProcessor })
        const strategy = createStrategy(scope)
        const handle = createWrapper(log, strategy, parser, serializer)
        return handle(event, ctx)
      } catch (err) {
        logFatal(context, err, 'resolve handler')
        throw err
      }
    }
  }

const registerEmptyDependencies = (container, config) => {}

const createNullProcessor = () => (event, context) => null
