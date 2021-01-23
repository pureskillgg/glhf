export const createEventStrategy = (container) => async (event, ctx) => {
  const scope = container.createScope()
  const processor = scope.resolve('processor')
  return processor(event, ctx)
}
