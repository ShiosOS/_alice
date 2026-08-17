import { deleteUserAccount } from '../../utils/auth-users'

export default defineEventHandler(async (event) => {
  const session = await requireUserSession(event)
  await deleteUserAccount(session.user.id)
  await clearUserSession(event)
  return { ok: true }
})
