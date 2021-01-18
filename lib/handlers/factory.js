export const createHandler = ({ parser, serializer }) => async (
  event,
  context
) => {
  const data = parser(event)
  return serializer(data)
}
