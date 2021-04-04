const index = import('./blue.mjs')

exports.handler = async (...args) => {
  const { handler } = await index
  return handler(...args)
}
