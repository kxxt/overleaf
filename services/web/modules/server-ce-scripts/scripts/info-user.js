/**
 * Backwards-compatible wrapper for info-user.mjs.
 */
async function main() {
  const { default: showUserInfo } = await import('./info-user.mjs')
  await showUserInfo()
}

main()
  .then(() => {
    console.error('Done.')
    process.exit(0)
  })
  .catch(error => {
    console.error(error)
    process.exit(1)
  })
