import { db, waitForDb } from '../../../app/src/infrastructure/mongodb.mjs'

export default async function countUsers() {
  await waitForDb()
  const count = await db.users.countDocuments()
  console.log('there are %d users', count)
}

if (import.meta.filename === process.argv[1]) {
  countUsers()
    .then(() => {
      console.error('Done.')
      process.exit(0)
    })
    .catch(error => {
      console.error(error)
      process.exit(1)
    })
}
