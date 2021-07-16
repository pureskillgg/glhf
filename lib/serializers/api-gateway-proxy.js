import { isNil, toJson } from '@meltwater/phi'

export const apiGatewayProxySerializer = (data) => data

export const apiGatewayProxyJsonSerializer = (data) => {
  if (isNil(data?.body)) return data
  return {
    isBase64Encoded: false,
    cookies: [],
    statusCode: 200,
    ...data,
    body: toJson(data.body),
    headers: {
      'content-type': 'application/json',
      ...data?.headers
    }
  }
}
