const index = import('./red.mjs')

exports.handler = async (...args) => {
  const { handler } = await index
  return handler(...args)
}
