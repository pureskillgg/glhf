import { ssmString } from '@pureskillgg/ace'

import { invokeHandler } from '../index.js'

const parameters = {
  blueLambdaFunction: ssmString('BLUE_LAMBDA_FUNCTION_SSM_PATH')
}

const createProcessor = ({ reqId }) => async (event, container) => {
  return event
}

const registerDependencies = (container, config) => {}

export const createHandleInvoke = invokeHandler({
  createProcessor,
  registerDependencies
})

export default createHandleInvoke(parameters)
