import { isNotArray } from '@meltwater/phi'

import { createCtx } from '../ctx.js'
import { registerContext } from '../container.js'
import { createRecordWrapper } from '../wrappers/index.js'

export const createParallelStrategy = (container) => async (event, ctx) => {
  validateEvent(event)

  const processRecord = (record) => {
    const scope = container.createScope()
    const parentLog = container.resolve('log')
    const recordCtx = createCtx(record, ctx)
    registerContext(scope, { ctx: recordCtx, log: parentLog })
    const log = scope.resolve('log')
    const processor = scope.resolve('processor')
    const handle = createRecordWrapper(log, processor)
    return handle(record, ctx)
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
