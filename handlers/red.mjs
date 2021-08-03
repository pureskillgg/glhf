import { asClass } from 'awilix'
import { LambdaClient } from '@pureskillgg/awsjs'
import { ssmString } from '@pureskillgg/ace'

import { invokeHandler } from '../index.js'

const parameters = {
  blueLambdaFunction: ssmString('BLUE_LAMBDA_FUNCTION_SSM_PATH')
}

const createProcessor = ({ blueLambdaClient, log }) => async (
  event,
  ctx
) => {
  return blueLambdaClient.invokeJson(event)
}

const registerDependencies = (container, config) => {
  container.register(
    'blueLambdaClient',
    asClass(LambdaClient).inject(() => ({
      name: 'blue',
      functionName: config.blueLambdaFunction,
      AwsLambdaClient: undefined,
      params: undefined
    }))
  )
}

export const createHandler = invokeHandler({
  parameters,
  createProcessor,
  registerDependencies
})

export const handler = createHandler(parameters)
