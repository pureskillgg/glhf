import { createLogger as createMlabsLogger } from '@meltwater/mlabs-logger'

const level = process.env.LOG_LEVEL || 'info'
const isDev = process.env.IS_OFFLINE || process.env.IS_LOCAL

const envBase = {
  isAppLog: false,
  '@env': process.env.LOG_ENV,
  '@service': process.env.LOG_SERVICE,
  '@system': process.env.LOG_SYSTEM,
  version: process.env.LOG_VERSION
}

export const createLogger = (ctx, t, options = {}) =>
  createMlabsLogger({
    name: getName(ctx),
    level,
    outputMode: isDev ? 'pretty' : 'json',
    t: t?.log == null ? { ...t, log: () => {} } : t,
    ...options,
    base: {
      ...createBase(ctx),
      ...options?.base ?? {}
    }
  })

export const logFatal = (context, err, msg) => {
  try {
    const fatalLog = createLogger(context)
    fatalLog.fatal({ err }, `fail to ${msg}`)
  } catch {
    const log = createMlabsLogger()
    log.fatal({ err }, `fail to ${msg} and fail to create valid logger`)
    throw err
  }
}

const createBase = ({ awsRequestId, functionName, reqId }) => {
  if (isDev) return {}
  return {
    ...envBase,
    awsRequestId,
    awsFunctionName: functionName,
    reqId
  }
}

const getName = ({ functionName }) => {
  if (!functionName) return
  const parts = functionName.split('-')
  if (parts.length < 3) return functionName
  if (parts.length === 3) return parts[2]
  return parts.slice(3).join('-')
}
