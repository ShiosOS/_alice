import { acceptTerms } from '../../utils/auth-users'

export default defineEventHandler(async (event) => {
  const session = await requireUserSession(event)
  const updated = await acceptTerms(session.user.id)
  if (!updated) {
    throw createError({ statusCode: 500, statusMessage: 'Could not accept terms' })
  }
  await setUserSession(event, {
    user: {
      ...session.user,
      termsAccepted: Boolean(updated.termsAcceptedAt),
    },
  })
  return { ok: true }
})
