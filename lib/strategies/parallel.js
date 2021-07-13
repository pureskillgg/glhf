import { isNotArray } from '@meltwater/phi'

import { createCtx } from '../ctx.js'
import { registerContext } from '../container.js'

export const createParallelStrategy = (container) => async (event, ctx) => {
  validateEvent(event)

  const processRecord = (record) => {
    const scope = container.createScope()
    const parentLog = container.resolve('log')
    const recordCtx = createCtx(record, ctx)
    registerContext(scope, { ctx: recordCtx, log: parentLog })
    const processor = scope.resolve('processor')
    const log = scope.resolve('log')
    const handle = createWrapper(processor, log)
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

const createWrapper = (processor, parentLog) => async (record, ctx) => {
  const log = parentLog.child({ meta: record, wrapper: 'record' })
  try {
    log.info('record: start')
    const data = await processor(record, ctx)
    log.debug({ data }, 'record: data')
    log.info('record: end')
    return data
  } catch (err) {
    log.error({ err }, 'record: fail')
    throw err
  }
}
