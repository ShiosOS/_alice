import { deleteUserAccount } from '../../utils/auth-users'

export default defineEventHandler(async (event) => {
  const session = await requireUserSession(event as never)
  await deleteUserAccount(session.user.id)
  await clearUserSession(event as never)
  return { ok: true }
})
