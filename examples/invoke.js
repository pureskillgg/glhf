import { readJson, LambdaClient } from '../index.js'

export const red = ({ redLambdaArn, log }) => async (req = 'req') => {
  const input = await readJson('fixtures', `${req}.json`)
  const client = new LambdaClient({
    name: 'red',
    arn: redLambdaArn,
    log
  })
  return client.invokeJson(input)
}