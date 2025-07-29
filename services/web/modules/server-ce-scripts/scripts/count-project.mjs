import { db, waitForDb } from '../../../app/src/infrastructure/mongodb.mjs'

export default async function countProjects() {
  await waitForDb()
  const count = await db.projects.countDocuments()
  console.log('there are %d projects', count)
}

if (import.meta.filename === process.argv[1]) {
  countProjects()
    .then(() => {
      console.error('Done.')
      process.exit(0)
    })
    .catch(error => {
      console.error(error)
      process.exit(1)
    })
}
