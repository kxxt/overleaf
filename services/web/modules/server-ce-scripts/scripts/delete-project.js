/**
 * Backwards-compatible wrapper for delete-project.mjs.
 */
async function main() {
  const { default: deleteProject } = await import('./delete-project.mjs')
  await deleteProject()
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
