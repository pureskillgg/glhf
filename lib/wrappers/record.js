export const createRecordWrapper =
  (parentLog, strategy) => async (event, ctx) => {
    const log = parentLog.child({ meta: event, wrapper: 'record' })
    try {
      log.info('handle: start')
      const data = await strategy(event, ctx)
      log.debug({ data }, 'handle: data')
      log.info('handle: end')
      return data
    } catch (err) {
      log.error({ err }, 'handle: fail')
      throw err
    }
  }
