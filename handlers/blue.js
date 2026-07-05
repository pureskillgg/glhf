'use strict'

const Sentry = require('@sentry/aws-serverless')

Sentry.init()

const index = import('./blue.mjs')

exports.handler = Sentry.wrapHandler(async (...args) => {
  const { handler } = await index
  return handler(...args)
})
