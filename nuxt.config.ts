// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  modules: ['@nuxt/eslint'],
  runtimeConfig: {
    databaseUrl: '',
    authSecret: '',
    googleClientId: '',
    googleClientSecret: '',
    youtubeApiKey: '',
    aiApiKey: '',
    aiBaseUrl: '',
    aiModel: '',
    expandDailyBudget: 50,
    expandDisabled: false,
    sentryDsn: '',
    public: {
      appUrl: 'http://localhost:3000',
    },
  },
})
