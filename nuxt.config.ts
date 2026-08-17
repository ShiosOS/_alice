// https://nuxt.com/docs/api/configuration/nuxt-config
import tailwindcss from '@tailwindcss/vite'

export default defineNuxtConfig({
  modules: ['@nuxt/eslint', 'nuxt-auth-utils', 'shadcn-nuxt'],
  devtools: { enabled: true },
  css: ['~/assets/css/tailwind.css'],
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
  compatibilityDate: '2025-07-15',
  vite: {
    plugins: [tailwindcss()],
  },
  typescript: {
    strict: true,
    tsConfig: {
      compilerOptions: {
        noUncheckedIndexedAccess: true,
      },
    },
  },
  eslint: {
    config: {
      stylistic: {
        indent: 2,
        quotes: 'single',
        semi: false,
      },
      tooling: true,
      formatters: true,
    },
  },
  shadcn: {
    prefix: '',
    componentDir: './app/components/ui',
  },
})
