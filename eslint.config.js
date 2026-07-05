import neostandard, { resolveIgnoresFromGitignore } from 'neostandard'
import prettier from 'eslint-config-prettier/flat'

export default [
  ...neostandard({
    env: ['node'],
    noStyle: true,
    ignores: resolveIgnoresFromGitignore()
  }),
  prettier
]
