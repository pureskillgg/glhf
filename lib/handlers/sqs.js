import { createParallelStrategy } from '../strategies/index.js'
import { sqsParser, sqsJsonParser } from '../parsers/index.js'
import { createHandler } from './factory.js'

export const sqsHandler = (options = {}) =>
  createHandler({
    parser: sqsParser,
    createStrategy: createParallelStrategy,
    ...options
  })

export const sqsJsonHandler = (options = {}) =>
  sqsHandler({
    parser: sqsJsonParser,
    ...options
  })
