import { getConfig } from '@pureskillgg/ace'

export const createGetConfig =
  ({ parameters, cache, aliases }) =>
  async (ctx, log) =>
    getConfig({
      parameters,
      cache,
      aliases,
      log: log.child({ isConfigLog: true })
    })
