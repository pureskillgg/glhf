const Sentry = require('@sentry/serverless')

Sentry.AWSLambda.init()

const index = import('./blue.mjs')

exports.handler = Sentry.AWSLambda.wrapHandler(async (...args) => {
  const { handler } = await index
  return handler(...args)
})
