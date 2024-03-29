export const createInvokeWrapper =
  (parentLog, strategy, parser, serializer) => async (event, ctx) => {
    const log = parentLog.child({ meta: event, wrapper: 'invoke' })
    try {
      log.info('handle: start')
      const parsedEvent = parser(event, ctx)
      log.info({ meta: parsedEvent }, 'handle: parse')
      const data = await strategy(parsedEvent, ctx)
      log.debug({ data }, 'handle: data')
      const serializedData = serializer(data, ctx)
      log.debug({ data: serializedData }, 'handle: serialize')
      log.info('handle: end')
      return serializedData
    } catch (err) {
      log.error({ err }, 'handle: fail')
      throw err
    }
  }
