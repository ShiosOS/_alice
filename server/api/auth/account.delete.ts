import { deleteUserAccount } from '../../utils/auth-users'

export default defineEventHandler(async (event) => {
  const session = await requireSession(event)
  await deleteUserAccount(session.user.id)
  await dropSession(event)
  return { ok: true }
})
