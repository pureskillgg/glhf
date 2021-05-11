const Sentry = require('@sentry/serverless')

Sentry.AWSLambda.init()

const index = import('../index.js')

exports.handler = Sentry.AWSLambda.wrapHandler(async () => {
  const { todo } = await index
  return {
    statusCode: 200,
    body: JSON.stringify({
      data: todo('TODO')
    })
  }
})
