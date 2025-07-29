/**
 * Backwards-compatible wrapper for list-user.mjs.
 */
async function main() {
  const { default: listUsers } = await import('./list-user.mjs')
  await listUsers()
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
