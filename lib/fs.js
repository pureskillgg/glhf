import { promises as fsPromises } from 'fs'
import path from 'path'

export const readJson = async (...args) => {
  const src = path.resolve(...args)
  const data = await fsPromises.readFile(src)
  return JSON.parse(data.toString())
}
