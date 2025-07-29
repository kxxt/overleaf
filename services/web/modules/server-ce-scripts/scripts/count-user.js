/**
 * Backwards-compatible wrapper for count-user.mjs.
 */
async function main() {
  const { default: countUsers } = await import('./count-user.mjs')
  await countUsers()
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
