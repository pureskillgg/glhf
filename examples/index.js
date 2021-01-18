import path from 'path'

import { createExamples } from '@meltwater/examplr'

import { red } from './invoke.js'

process.env.AWS_SDK_LOAD_CONFIG = 'true'

const examples = {
  red
}

const envVars = ['LOG_LEVEL', 'LOG_FILTER', 'LOG_OUTPUT_MODE']

const defaultOptions = {
  redLambdaArn: 'arn:aws:lambda:us-east-1:638712938487:function:glhf-stg-red'
}
const { runExample } = createExamples({
  examples,
  envVars,
  defaultOptions
})

runExample({
  local: path.resolve('examples', 'local.json')
})
