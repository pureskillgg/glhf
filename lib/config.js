import { getConfig as getAceConfig } from '@pureskillgg/ace'

export const getConfig = async ({ parameters, cache, aliases, log }) =>
  getAceConfig({
    parameters,
    cache,
    aliases,
    log: log.child({ isConfigLog: true })
  })
