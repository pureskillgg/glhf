import test from 'ava'

import { readJson } from '../index.js'

test('readJson', async (t) => {
  const data = await readJson('fixtures', 'req.json')
  t.deepEqual(data, { gg: 'wp' })
})
