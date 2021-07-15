import { isNotArray, noop } from '@meltwater/phi'

import { createCtx } from '../ctx.js'
import { registerContext } from '../container.js'
import { createRecordWrapper } from '../wrappers/index.js'

export const createParallelStrategy = (container) => async (event, ctx) => {
  validateEvent(event)

  const processRecord = async (record) => {
    const scope = container.createScope()
    const parentLog = container.resolve('log')
    const recordCtx = createCtx(record, ctx)
    registerContext(scope, { ctx: recordCtx, log: parentLog })
    const log = scope.resolve('log')
    const processor = scope.resolve('processor')
    const onError =
      scope.resolve('onError', { allowUnregistered: true }) ?? noop
    const handle = createRecordWrapper(log, processor)

    try {
      return await handle(record, recordCtx)
    } catch (err) {
      onError(err)
      throw err
    }
  }

  return Promise.all(event.map(processRecord))
}

const validateEvent = (event) => {
  if (isNotArray(event)) {
    throw new Error(
      'Cannot use parallel strategy with event which does not parse to an array'
    )
  }
}
