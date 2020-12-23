export default () => ({
  files: [specs(), '!dist/**/*', '!package/**/*'],
  babel: true
})

const specs = () => {
  if (isBabelRequired()) return '.dist/**/*.spec.cjs'
  return '**/*.spec.js'
}

const isBabelRequired = () => {
  const [majorVer] = process.versions.node.split('.')
  return Number(majorVer) < 14
}
