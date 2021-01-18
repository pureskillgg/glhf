import AWS from 'aws-sdk'
import { v4 as uuidv4 } from 'uuid'
import { createLogger } from '@meltwater/mlabs-logger'
import { toJson } from '@meltwater/phi'

export class S3Client {
  #client
  #reqId
  #log

  constructor({
    bucket,
    name = 's3',
    reqId = uuidv4(),
    log = createLogger(),
    S3,
    params = {}
  }) {
    const defaultParams = { Bucket: bucket, ...params }
    const Client = S3 || AWS.S3
    this.#client = new Client({ params: defaultParams })
    this.#reqId = reqId
    this.#log = log.child({
      defaultParams,
      client: name,
      class: 'S3Client',
      reqId
    })
  }

  async uploadJson(key, input, params = {}) {
    const log = this.#log.child({
      meta: { key, ...params },
      method: 'uploadJson'
    })
    try {
      log.info({ data: input }, 'start')

      const req = {
        Key: key,
        Body: toJson(input),
        ContentType: 'application/json',
        ...params,
        Metadata: {
          ...params.Metadata,
          'request-id': this.#reqId
        }
      }

      const data = await this.#client.upload(req).promise()

      log.debug({ data }, 'data')
      log.info('end')
      return data
    } catch (err) {
      log.error({ err }, 'fail')
      throw err
    }
  }
}
