import { z } from 'zod'
import { upsertGoogleUser } from '../../utils/auth-users'
import { captureServerException } from '../../utils/sentry'

const googleProfileSchema = z.object({
  sub: z.string().min(1),
  email: z.string().email(),
  name: z.string().nullish(),
  picture: z.string().nullish(),
})

export default defineOAuthGoogleEventHandler({
  config: {
    scope: ['openid', 'email', 'profile'],
  },
  async onSuccess(event, { user }) {
    try {
      const profile = googleProfileSchema.safeParse(user)
      if (!profile.success) {
        throw createError({ statusCode: 401, statusMessage: 'Google profile missing email' })
      }
      const record = await upsertGoogleUser({
        sub: profile.data.sub,
        email: profile.data.email,
        name: profile.data.name,
        image: profile.data.picture,
      })
      if (!record) {
        throw createError({ statusCode: 500, statusMessage: 'Could not create user' })
      }

      await saveSession(event, {
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
        return redirect(event, '/terms-accept')
      }
      return redirect(event, '/rabbit-holes')
    }
    catch (error) {
      captureServerException(error, { route: '/auth/google' })
      return redirect(event, '/?authError=1')
    }
  },
  onError(event, error) {
    console.error('Google OAuth error', error)
    captureServerException(error, { route: '/auth/google', phase: 'oauth' })
    return redirect(event, '/?authError=1')
  },
})
