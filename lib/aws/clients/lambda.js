import AWS from 'aws-sdk'
import { v4 as uuidv4 } from 'uuid'
import { createLogger } from '@meltwater/mlabs-logger'
import { fromJson, toJson } from '@meltwater/phi'

export class LambdaClient {
  #client
  #reqId
  #log

  constructor({
    functionName,
    name = 'lambda',
    reqId = uuidv4(),
    log = createLogger(),
    Lambda,
    params = {}
  }) {
    const defaultParams = { FunctionName: functionName, ...params }
    const Client = Lambda || AWS.Lambda
    this.#client = new Client({ params: defaultParams })
    this.#reqId = reqId
    this.#log = log.child({
      defaultParams,
      client: name,
      class: 'LambdaClient',
      reqId
    })
  }

  async invokeJson(input, params = {}) {
    const log = this.#log.child({
      meta: params,
      method: 'invokeJson'
    })
    try {
      log.info({ data: input }, 'start')

      const req = {
        Payload: toJson({ ...input, reqId: this.#reqId }),
        ...params
      }

      const res = await this.#client.invoke(req).promise()
      const statusCode = res.StatusCode

      checkStatusCode(statusCode)
      checkFunctionError(res)

      const data = fromJson(res.Payload)
      log.debug({ data, statusCode }, 'data')
      log.info({ statusCode }, 'end')
      return data
    } catch (err) {
      log.error({ err }, 'fail')
      throw err
    }
  }
}

// NOTE: https://docs.amazonaws.cn/en_us/lambda/latest/dg/nodejs-exceptions.html
const checkStatusCode = (statusCode) => {
  const is200StatusCode = statusCode > 199 && statusCode < 300

  if (is200StatusCode) return

  const err = new Error(`Status code error: ${statusCode}`)
  err.statusCode = statusCode
  err.code = 'err_lambda_status_code'
  throw err
}

// NOTE: https://docs.amazonaws.cn/en_us/lambda/latest/dg/nodejs-exceptions.html
const checkFunctionError = (res) => {
  if (!res.FunctionError) return
  const data = fromJson(res.Payload)
  const { errorType, errorMessage } = data
  const err = new Error(`Lambda function error: ${errorType}<${errorMessage}>`)
  err.data = data
  err.code = 'err_lambda_function'
  throw err
}
