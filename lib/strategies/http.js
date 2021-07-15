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
    return toErrorResponse(error)
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
