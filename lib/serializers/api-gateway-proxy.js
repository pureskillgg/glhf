import { isNil } from '@meltwater/phi'

export const apiGatewayProxySerializer = (data) => ({
  statusCode: 200,
  ...data
})

export const apiGatewayProxyJsonSerializer = (data) => ({
  ...apiGatewayProxySerializer(data),
  body: isNil(data.body) ? undefined : JSON.stringify(data.body)
})
