import fs from 'fs'
import path from 'path'

export const readJson = async (...args) => {
  const src = path.resolve(...args)
  const data = await fs.promises.readFile(src)
  return JSON.parse(data.toString())
}
