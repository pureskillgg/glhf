import { createLogger, logFatal } from '../logger.js'
import { identityParser } from '../parsers/index.js'
import { identitySerializer } from '../serializers/index.js'
import { createInvokeWrapper } from '../wrappers/index.js'
import { createContainer } from '../container.js'
import { createCache } from '../cache.js'
import { createGetConfig } from '../config.js'
import { createCtx } from '../ctx.js'

export const createHandler = ({
  parser = identityParser,
  serializer = identitySerializer,
  createProcessor = createDefaultProcessor,
  registerDependencies = registerDefaultDependencies,
  createWrapper = createInvokeWrapper,
  t
}) => (parameters) => {
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

      const handle = createWrapper(container, { parser, serializer })
      return handle(event, context)
    } catch (err) {
      logFatal(err, 'fail to resolve handler')
      throw err
    }
  }
}

const registerDefaultDependencies = (container, config) => {}

const createDefaultProcessor = () => (event, context) => null
