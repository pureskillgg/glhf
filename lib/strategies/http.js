import { noop } from '@meltwater/phi'
import { boomify, isBoom } from '@hapi/boom'

export const createHttpStrategy = (container) => async (event, ctx) => {
  const scope = container.createScope()
  const processor = scope.resolve('processor')
  const onError = scope.resolve('onError', { allowUnregistered: true }) ?? noop
  try {
    return await processor(event, ctx)
  } catch (err) {
    const error = wrapError(err)
    onError(error)
    const log = scope.resolve('log')
    const data = toErrorResponse(error)
    log.warn({ err, data }, 'http error response')
    return data
  }
}

const wrapError = (err) =>
  isBoom(err) ? err : boomify(err, { statusCode: 500 })

const toErrorResponse = (err) => {
  const { output } = err
  return {
    statusCode: output.statusCode
  }
}
