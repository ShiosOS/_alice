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
