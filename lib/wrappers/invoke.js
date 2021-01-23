export const createInvokeWrapper = (
  container,
  { parser, serializer }
) => async (event, ctx) => {
  const log = container
    .resolve('log')
    .child({ meta: event, wrapper: 'default' })
  try {
    log.info('handle: start')
    const parsedEvent = parser(event, ctx)
    log.info({ meta: parsedEvent }, 'handle: parse')

    const scope = container.createScope()
    const processor = scope.resolve('processor')
    const data = await processor(parsedEvent, ctx)

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
