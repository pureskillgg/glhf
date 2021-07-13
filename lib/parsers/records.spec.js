import test from 'ava'

import { recordsParser } from './records.js'

test('recordsParser: parses event', (t) => {
  const Records = [
    { body: 'mock-body-1' },
    { body: 'mock-body-2' }
  ]
  const event = { Records }
  t.deepEqual(recordsParser(event), Records)
})

test('recordsParser: parses event when missing records', (t) => {
  const event = {}
  t.deepEqual(recordsParser(event), [])
})
