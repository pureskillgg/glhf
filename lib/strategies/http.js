import { noop } from '@meltwater/phi'
import { Boom, boomify, isBoom } from '@hapi/boom'

export const createHttpStrategy = (container) => async (event, ctx) => {
  const scope = container.createScope()
  const processor = scope.resolve('processor')
  const onError = scope.resolve('onError', { allowUnregistered: true }) ?? noop
  try {
    return await processor(event, ctx)
  } catch (err) {
    onError(err)
    const error = wrapError(err)
    const log = scope.resolve('log')
    const data = toErrorResponse(error)
    log.warn({ err, data }, 'http error response')
    return data
  }
}

const wrapError = (err) => {
  try {
    if (isBoom(err)) return err
    return boomify(err, { statusCode: 500 })
  } catch {
    return new Boom(err?.message ?? 'Unknown Error')
  }
}

const toErrorResponse = (err) => {
  const { output } = err
  return {
    statusCode: output.statusCode
  }
}
