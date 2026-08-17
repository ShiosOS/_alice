// https://nuxt.com/docs/api/configuration/nuxt-config
import tailwindcss from '@tailwindcss/vite'

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  modules: ['@nuxt/eslint', 'nuxt-auth-utils', 'shadcn-nuxt'],
  css: ['~/assets/css/tailwind.css'],
  vite: {
    plugins: [tailwindcss()],
  },
  shadcn: {
    prefix: '',
    componentDir: './app/components/ui',
  },
  typescript: {
    strict: true,
    tsConfig: {
      compilerOptions: {
        noUncheckedIndexedAccess: true,
      },
    },
  },
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
    expandDailyBudget: 50,
    expandDisabled: false,
    sentryDsn: '',
    public: {
      appUrl: 'http://localhost:3000',
    },
  },
})
