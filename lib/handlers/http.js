import { createHttpStrategy } from '../strategies/index.js'
import {
  apiGatewayProxyJsonParser,
  apiGatewayProxyParser
} from '../parsers/index.js'
import {
  apiGatewayProxyJsonSerializer,
  apiGatewayProxySerializer
} from '../serializers/index.js'

import { createHandler } from './factory.js'

export const httpHandler = (options = {}) =>
  createHandler({
    parser: apiGatewayProxyParser,
    serializer: apiGatewayProxySerializer,
    createStrategy: createHttpStrategy,
    ...options
  })

export const httpJsonHandler = (options = {}) =>
  httpHandler({
    parser: apiGatewayProxyJsonParser,
    serializer: apiGatewayProxyJsonSerializer,
    ...options
  })
