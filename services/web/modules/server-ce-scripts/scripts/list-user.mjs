import { db, waitForDb } from '../../../app/src/infrastructure/mongodb.mjs'

export default async function listUsers() {
  await waitForDb()
  const users = await db.users
    .find(
      {},
      {
        projection: {
          gid: 1,
          zjhm: 1,
          email: 1,
          isAdmin: 1,
          lastLoggedIn: 1,
        },
      }
    )
    .toArray()

  for (const user of users) {
    console.log(
      user._id,
      user.gid,
      user.zjhm,
      user.email,
      user.isAdmin,
      user.lastLoggedIn
    )
  }
}

if (import.meta.filename === process.argv[1]) {
  listUsers()
    .then(() => {
      console.error('Done.')
      process.exit(0)
    })
    .catch(error => {
      console.error(error)
      process.exit(1)
    })
}
