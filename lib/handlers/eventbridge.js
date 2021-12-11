import { createParallelStrategy } from '../strategies/index.js'
import { eventbridgeParser } from '../parsers/index.js'

import { createHandler } from './factory.js'

export const eventbridgeHandler = (options = {}) =>
  createHandler({
    parser: eventbridgeParser,
    createStrategy: createParallelStrategy,
    ...options
  })
