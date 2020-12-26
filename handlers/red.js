import { getConfig, ssmString } from '@meltwater/ace'

const parameters = {
  blueLambdaArn: ssmString('BLUE_LAMBDA_ARN_SSM_PATH')
}

export default async () => {
  return getConfig({
    parameters,
    aliases: process.env
  })
}
