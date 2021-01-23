import { createLogger, logFatal } from '../logger.js'
import { identityParser } from '../parsers/index.js'
import { identitySerializer } from '../serializers/index.js'
import { createInvokeWrapper } from '../wrappers/index.js'
import { createEventStrategy } from '../strategies/index.js'
import { createContainer } from '../container.js'
import { createCache } from '../cache.js'
import { createGetConfig } from '../config.js'
import { createCtx } from '../ctx.js'

export const createHandler = ({
  parser = identityParser,
  serializer = identitySerializer,
  createProcessor = createNullProcessor,
  registerDependencies = registerEmptyDependencies,
  createWrapper = createInvokeWrapper,
  createStrategy = createEventStrategy
}) => (parameters, t, overrideDependencies = registerEmptyDependencies) => {
  const cache = createCache()
  const getConfig = createGetConfig(parameters, cache)

  return async (event, context) => {
    try {
      const ctx = createCtx(event, context)
      const log = createLogger(ctx, t)
      const config = await getConfig(ctx, log)

      const container = createContainer(config, {
        ctx,
        log,
        createProcessor
      })

      registerDependencies(container, config)
      overrideDependencies(container, config)

      const strategy = createStrategy(container)
      const handle = createWrapper(parser, serializer, strategy, log)
      return handle(event, context)
    } catch (err) {
      logFatal(context, err, 'fail to resolve handler')
      throw err
    }
  }
}

const registerEmptyDependencies = (container, config) => {}

const createNullProcessor = () => (event, context) => null
