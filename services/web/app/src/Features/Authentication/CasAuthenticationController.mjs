import { randomUUID } from 'node:crypto'
import { fetchString } from '@overleaf/fetch-utils'
import logger from '@overleaf/logger'
import { expressify } from '@overleaf/promise-utils'
import Settings from '@overleaf/settings'
import xml2js from 'xml2js'
import { User } from '../../models/User.mjs'
import EmailHelper from '../Helpers/EmailHelper.mjs'
import UserCreator from '../User/UserCreator.mjs'
import AuthenticationController from './AuthenticationController.mjs'

function first(value) {
  return Array.isArray(value) ? value[0] : value
}

function parseCasAttributes(result) {
  const response = result?.['cas:serviceResponse']
  const success = first(response?.['cas:authenticationSuccess'])
  const attributes = first(
    success?.['cas:attributes'] ?? success?.attributes
  )

  const rawEmail = first(attributes?.['cas:email'] ?? attributes?.email)
  const email = EmailHelper.parseEmail(rawEmail?.split(',')[0])
  const gid = first(attributes?.['cas:gid'] ?? attributes?.gid)?.trim()
  const zjhm = first(attributes?.['cas:zjhm'] ?? attributes?.zjhm)?.trim()

  if (!email || !gid || !zjhm) {
    throw new Error('CAS response is missing required user attributes')
  }
  return { email, gid, zjhm }
}

async function findOrCreateUser({ email, gid, zjhm }) {
  const [userByGid, userByEmail] = await Promise.all([
    User.findOne({ gid }).exec(),
    User.findOne({ email }).exec(),
  ])

  if (
    userByGid &&
    userByEmail &&
    !userByGid._id.equals(userByEmail._id)
  ) {
    throw new Error('CAS identity conflicts with an existing user')
  }

  let user = userByGid ?? userByEmail
  if (!user) {
    user = await UserCreator.promises.createNewUser(
      {
        email,
        gid,
        zjhm,
        holdingAccount: false,
        analyticsId: randomUUID(),
      },
      { confirmedAt: new Date() }
    )
    return { user, isNewUser: true }
  }

  if (user.gid && user.gid !== gid) {
    throw new Error('CAS identity conflicts with the account email')
  }

  const update = {}
  if (!user.gid) update.gid = gid
  if (user.zjhm !== zjhm) update.zjhm = zjhm
  if (Object.keys(update).length > 0) {
    await User.updateOne({ _id: user._id }, { $set: update }).exec()
    Object.assign(user, update)
  }

  return { user, isNewUser: false }
}

async function login(req, res) {
  if (
    req.query.redir != null &&
    AuthenticationController.getRedirectFromSession(req) == null
  ) {
    AuthenticationController.setRedirectInSession(req, req.query.redir)
  }

  const casBaseUrl = `${Settings.casURL.replace(/\/+$/, '')}/`
  const service = Settings.casServiceStr
  const ticket = typeof req.query.ticket === 'string' ? req.query.ticket : null

  if (!ticket) {
    const loginUrl = new URL('login', casBaseUrl)
    loginUrl.searchParams.set('service', service)
    return res.redirect(loginUrl.toString())
  }

  const validationUrl = new URL('serviceValidate', casBaseUrl)
  validationUrl.searchParams.set('service', service)
  validationUrl.searchParams.set('ticket', ticket)

  let result
  try {
    const xml = await fetchString(validationUrl, {
      signal: AbortSignal.timeout(10_000),
    })
    result = await xml2js.parseStringPromise(xml)
  } catch (err) {
    logger.warn({ err }, 'CAS ticket validation request failed')
    throw new Error('Failed to validate CAS ticket', { cause: err })
  }

  const identity = parseCasAttributes(result)
  const { user, isNewUser } = await findOrCreateUser(identity)
  if (isNewUser) req.session.justRegistered = true

  AuthenticationController.setAuditInfo(req, {
    method: isNewUser ? 'CAS register' : 'CAS login',
  })
  await AuthenticationController.promises.finishLogin(user, req, res)
}

export default {
  login: expressify(login),
  parseCasAttributes,
  promises: {
    findOrCreateUser,
    login,
  },
}
