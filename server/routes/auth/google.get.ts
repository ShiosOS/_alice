import { upsertGoogleUser } from '../../utils/auth-users'
import { captureServerException } from '../../utils/sentry'

export default defineOAuthGoogleEventHandler({
  config: {
    scope: ['openid', 'email', 'profile'],
  },
  async onSuccess(event, { user }) {
    try {
      const record = await upsertGoogleUser({
        sub: user.sub,
        email: user.email,
        name: user.name,
        image: user.picture,
      })
      if (!record) {
        throw createError({ statusCode: 500, statusMessage: 'Could not create user' })
      }

      await setUserSession(event, {
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
        return sendRedirect(event, '/terms-accept')
      }
      return sendRedirect(event, '/rabbit-holes')
    }
    catch (error) {
      captureServerException(error, { route: '/auth/google' })
      return sendRedirect(event, '/?authError=1')
    }
  },
  onError(event, error) {
    console.error('Google OAuth error', error)
    captureServerException(error, { route: '/auth/google', phase: 'oauth' })
    return sendRedirect(event, '/?authError=1')
  },
})
