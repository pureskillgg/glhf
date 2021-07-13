import { isNotArray } from '@meltwater/phi'

import { createCtx } from '../ctx.js'
import { registerContext } from '../container.js'

export const createParallelStrategy = (container) => async (event, ctx) => {
  validateEvent(event)

  const processRecord = (record) => {
    const scope = container.createScope()
    const log = container.resolve('log')
    const recordCtx = createCtx(record, ctx)
    registerContext(scope, { ctx: recordCtx, log })
    const processor = scope.resolve('processor')
    return processor(record, ctx)
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
