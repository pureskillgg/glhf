import { getConfig, ssmString } from '@pureskillgg/ace'

const parameters = {
  blueLambdaFunction: ssmString('BLUE_LAMBDA_FUNCTION_SSM_PATH')
}

export default async () => {
  return getConfig({
    parameters,
    aliases: process.env
  })
}
