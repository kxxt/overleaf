/**
 * Backwards-compatible wrapper for count-project.mjs.
 */
async function main() {
  const { default: countProjects } = await import('./count-project.mjs')
  await countProjects()
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
