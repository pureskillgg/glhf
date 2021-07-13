import { createParallelStrategy } from '../strategies/index.js'
import { sqsParser, sqsJsonParser } from '../parsers/index.js'
import { createHandler } from './factory.js'

export const sqsHandler = (options = {}) =>
  createHandler({
    parsers: sqsParser,
    createStrategy: createParallelStrategy,
    ...options
  })

export const sqsJsonHandler = (options = {}) =>
  sqsJsonHandler({
    parsers: sqsJsonParser,
    ...options
  })
