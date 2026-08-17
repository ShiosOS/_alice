import withNuxt from './.nuxt/eslint.config.mjs'

export default withNuxt(
  {
    files: ['app/**/*.{ts,vue}', 'server/**/*.ts', 'shared/**/*.ts', 'nuxt.config.ts'],
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-unsafe-assignment': 'error',
      '@typescript-eslint/no-unsafe-member-access': 'error',
      '@typescript-eslint/no-unnecessary-type-assertion': 'error',
      'no-nested-ternary': 'error',
      'complexity': ['error', { max: 25 }],
      'max-depth': ['error', { max: 5 }],
    },
  },
  {
    // Generated shadcn-vue components — don't fight their prop defaults
    files: ['app/components/ui/**/*.{ts,vue}'],
    rules: {
      'vue/require-default-prop': 'off',
    },
  },
  {
    files: [
      'server/api/**/*.ts',
      'server/middleware/**/*.ts',
      'server/routes/**/*.ts',
    ],
    rules: {
      'no-restricted-syntax': ['error', {
        selector: 'TSAsExpression[typeAnnotation.typeName.name="never"]',
        message: 'Do not use `as never`. Use the session adapter if auth event types mismatch.',
      }],
    },
  },
)
