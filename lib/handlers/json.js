import { identityParser } from '../parsers/index.js'
import { identitySerializer } from '../serializers/index.js'

import { createHandler } from './factory.js'

export const createJsonHandler = (options) =>
  createHandler({
    ...options,
    parser: identityParser,
    serializer: identitySerializer
  })
