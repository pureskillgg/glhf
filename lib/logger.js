import { createLogger as createMlabsLogger } from '@meltwater/mlabs-logger'

const name = process.env.LOG_NAME || 'glhf'
const level = process.env.LOG_LEVEL || 'info'
const isDev = process.env.IS_OFFLINE || process.env.IS_LOCAL

const envBase = {
  isAppLog: false,
  '@env': process.env.LOG_ENV,
  '@service': process.env.LOG_SERVICE,
  '@system': process.env.LOG_SYSTEM,
  version: process.env.LOG_VERSION
}

export const createLogger = (ctx, t) =>
  createMlabsLogger({
    name,
    level,
    base: createBase(ctx),
    outputMode: isDev ? 'pretty' : 'json',
    t
  })

export const logFatal = (err, msg) => {
  try {
    const fatalLog = createLogger()
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
    functionName,
    reqId
  }
}
