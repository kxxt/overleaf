import minimist from 'minimist'
import UserGetter from '../../../app/src/Features/User/UserGetter.mjs'
import { waitForDb } from '../../../app/src/infrastructure/mongodb.mjs'

export default async function showUserInfo() {
  const { email } = minimist(process.argv.slice(2), {
    string: ['email'],
  })
  if (!email) {
    throw new Error(
      `Usage: node ${import.meta.filename} --email=joe@example.com`
    )
  }

  await waitForDb()
  const user = await UserGetter.promises.getUser(
    { email },
    {
      gid: 1,
      zjhm: 1,
      isAdmin: 1,
      email: 1,
      signUpDate: 1,
      lastLoggedIn: 1,
      lastLoginIp: 1,
      loginCount: 1,
    }
  )
  if (!user) throw new Error(`user not found: ${email}`)

  console.log(
    user._id,
    user.gid,
    user.zjhm,
    user.isAdmin,
    user.email,
    user.signUpDate,
    user.lastLoggedIn,
    user.lastLoginIp,
    user.loginCount
  )
}

if (import.meta.filename === process.argv[1]) {
  showUserInfo()
    .then(() => {
      console.error('Done.')
      process.exit(0)
    })
    .catch(error => {
      console.error(error)
      process.exit(1)
    })
}
