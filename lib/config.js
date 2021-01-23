import { getConfig } from '@pureskillgg/ace'

export const createGetConfig = (parameters, cache) => {
  const aliases = { ...process.env }
  return async (ctx, log) =>
    getConfig({
      parameters,
      aliases,
      cache,
      log: log.child({ isConfigLog: true })
    })
}
