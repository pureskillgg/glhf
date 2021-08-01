import { createLogger, logFatal } from '../logger.js'
import { identityParser } from '../parsers/index.js'
import { identitySerializer } from '../serializers/index.js'
import { createInvokeWrapper } from '../wrappers/index.js'
import { createEventStrategy } from '../strategies/index.js'
import { createContainer, createScope } from '../container.js'
import { createCache } from '../cache.js'
import { createGetConfig } from '../config.js'
import { createCtx } from '../ctx.js'

export const createHandler =
  ({
    parser = identityParser,
    serializer = identitySerializer,
    createProcessor = createNullProcessor,
    registerDependencies = registerEmptyDependencies,
    createWrapper = createInvokeWrapper,
    createStrategy = createEventStrategy
  }) =>
  (parameters, t, overrideDependencies = registerEmptyDependencies) => {
    const cache = createCache()
    const container = createContainer()

    const getConfig = createGetConfig({
      parameters,
      cache,
      aliases: t ? undefined : { ...process.env }
    })

    return async (event, context = {}) => {
      try {
        const ctx = createCtx(event, context)
        const log = createLogger(ctx, t)
        const config = await getConfig(ctx, log)

        registerDependencies(container, config)
        overrideDependencies(container, config)

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
