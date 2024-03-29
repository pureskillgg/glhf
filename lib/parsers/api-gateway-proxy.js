import { fromJson, isNil } from '@meltwater/phi'

export const apiGatewayProxyParser = (event) => {
  const { version } = event

  if (version !== '2.0') {
    throw new Error(
      `Only API Gateway Proxy payload version 2.0 supported, got version ${version}`
    )
  }

  return {
    ...event,
    searchParams: new URLSearchParams(event.rawQueryString ?? '')
  }
}

export const apiGatewayProxyJsonParser = (event) => ({
  ...apiGatewayProxyParser(event),
  body: isNil(event.body) ? undefined : fromJson(event.body)
})
