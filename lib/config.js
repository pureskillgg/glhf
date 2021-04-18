import { getConfig } from '@pureskillgg/ace'

export const createGetConfig = ({
  parameters,
  cache,
  localParameters,
  aliases
}) => {
  const env = { ...process.env }
  return async (ctx, log) =>
    getConfig({
      parameters,
      cache,
      aliases: aliases === undefined ? env : aliases,
      localParameters: localParameters === undefined ? env : localParameters,
      log: log.child({ isConfigLog: true })
    })
}
