import minimist from 'minimist'
import ProjectGetter from '../../../app/src/Features/Project/ProjectGetter.mjs'
import UserGetter from '../../../app/src/Features/User/UserGetter.mjs'
import { waitForDb } from '../../../app/src/infrastructure/mongodb.mjs'

export default async function listUserProjects() {
  const { email } = minimist(process.argv.slice(2), {
    string: ['email'],
  })
  if (!email) {
    throw new Error(
      `Usage: node ${import.meta.filename} --email=joe@example.com`
    )
  }

  await waitForDb()
  const user = await UserGetter.promises.getUser({ email }, { _id: 1 })
  if (!user) throw new Error(`user not found: ${email}`)

  const projects = await ProjectGetter.promises.findAllUsersProjects(
    user._id,
    { name: 1, active: 1, lastUpdated: 1 }
  )
  console.log(projects)
}

if (import.meta.filename === process.argv[1]) {
  listUserProjects()
    .then(() => {
      console.error('Done.')
      process.exit(0)
    })
    .catch(error => {
      console.error(error)
      process.exit(1)
    })
}
