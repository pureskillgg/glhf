import { noop } from '@meltwater/phi'

export const createEventStrategy = (container) => async (event, ctx) => {
  const scope = container.createScope()
  const processor = scope.resolve('processor')
  const onError = scope.resolve('onError', { allowUnregistered: true }) ?? noop
  try {
    return await processor(event, ctx)
  } catch (err) {
    onError(err)
    throw err
  }
}
