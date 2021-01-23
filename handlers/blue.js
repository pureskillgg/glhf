import { invokeHandler } from '../index.js'

const createProcessor = () => async (event, container) => {
  return event
}

export const createHandleInvoke = invokeHandler({
  createProcessor
})

export default createHandleInvoke()
