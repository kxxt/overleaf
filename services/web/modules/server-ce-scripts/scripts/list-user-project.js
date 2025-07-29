/**
 * Backwards-compatible wrapper for list-user-project.mjs.
 */
async function main() {
  const { default: listUserProjects } = await import('./list-user-project.mjs')
  await listUserProjects()
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
