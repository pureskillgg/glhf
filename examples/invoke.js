import { LambdaClient } from '@pureskillgg/awsjs'

import { readJson } from '../index.js'

export const red = ({ redLambdaArn, log }) => async (req = 'req') => {
  const input = await readJson('fixtures', `${req}.json`)
  const client = new LambdaClient({
    name: 'red',
    functionName: redLambdaArn,
    log
  })
  return client.invokeJson(input)
}
