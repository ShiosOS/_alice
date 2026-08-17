// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  modules: ['@nuxt/eslint', 'nuxt-auth-utils'],
  runtimeConfig: {
    databaseUrl: '',
    session: {
      password: '',
      maxAge: 60 * 60 * 24 * 30,
    },
    oauth: {
      google: {
        clientId: '',
        clientSecret: '',
      },
    },
    youtubeApiKey: '',
    aiApiKey: '',
    aiBaseUrl: '',
    aiModel: '',
    expandDailyBudget: 5,
    expandDisabled: false,
    sentryDsn: '',
    public: {
      appUrl: 'http://localhost:3000',
    },
  },
})
