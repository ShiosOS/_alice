import { upsertGoogleUser } from '../../utils/auth-users'

export default defineOAuthGoogleEventHandler({
  config: {
    scope: ['openid', 'email', 'profile'],
  },
  async onSuccess(event, { user }) {
    const record = await upsertGoogleUser({
      sub: user.sub,
      email: user.email,
      name: user.name,
      image: user.picture,
    })
    if (!record) {
      throw createError({ statusCode: 500, statusMessage: 'Could not create user' })
    }

    await setUserSession(event as never, {
      user: {
        id: record.id,
        email: record.email,
        name: record.name,
        image: record.image,
        termsAccepted: Boolean(record.termsAcceptedAt),
      },
      loggedInAt: new Date().toISOString(),
    })

    if (!record.termsAcceptedAt) {
      return sendRedirect(event as never, '/terms-accept')
    }
    return sendRedirect(event as never, '/rabbit-holes')
  },
  onError(event, error) {
    console.error('Google OAuth error', error)
    return sendRedirect(event as never, '/?authError=1')
  },
})
