export const createRecordWrapper =
  (parentLog, strategy) => async (event, ctx) => {
    const log = parentLog.child({ meta: event, wrapper: 'record' })
    try {
      log.info('event: start')
      const data = await strategy(event, ctx)
      log.debug({ data }, 'event: data')
      log.info('event: end')
      return data
    } catch (err) {
      log.error({ err }, 'event: fail')
      throw err
    }
  }
