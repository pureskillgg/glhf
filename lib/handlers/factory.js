import { v4 as uuidv4 } from 'uuid'

export const createHandler = ({ parser, serializer, createProcessor }) => (
  parameters
) => {
  return async (event, context) => {
    const processor = createProcessor({ reqId: uuidv4() })
    const input = parser(event)
    const data = processor(input)
    const output = serializer(data)
    return output
  }
}
