import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vitest/config'
import { defineVitestProject } from '@nuxt/test-utils/config'

const root = fileURLToPath(new URL('./', import.meta.url))
const appDir = fileURLToPath(new URL('./app', import.meta.url))
const sharedDir = fileURLToPath(new URL('./shared', import.meta.url))

export default defineConfig({
  test: {
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov'],
      // Pure domain modules only — AI/DB-heavy services stay out of the gate.
      include: [
        'server/services/youtube/video-id.ts',
        'server/services/rabbit-holes/mappers.ts',
        'server/services/expand/constants.ts',
        'server/lib/**',
        'app/utils/merge-expand-patch.ts',
        'shared/**',
      ],
      thresholds: {
        lines: 90,
        branches: 85,
        functions: 90,
        statements: 90,
      },
    },
    projects: [
      {
        resolve: {
          alias: {
            '~': appDir,
            '~~': root,
            '#shared': sharedDir,
          },
        },
        test: {
          name: 'unit',
          include: ['tests/unit/**/*.spec.ts'],
          environment: 'node',
        },
      },
      {
        test: {
          name: 'e2e',
          include: ['tests/e2e/**/*.spec.ts'],
          environment: 'node',
        },
      },
      // Reserved for Nuxt-environment tests (task 6 / as needed).
      await defineVitestProject({
        test: {
          name: 'nuxt',
          include: ['tests/nuxt/**/*.spec.ts'],
          environment: 'nuxt',
        },
      }),
    ],
  },
})
