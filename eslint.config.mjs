import withNuxt from './.nuxt/eslint.config.mjs'

export default withNuxt({
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
    'no-restricted-syntax': ['error', {
      selector: 'TSAsExpression[typeAnnotation.typeName.name="never"]',
      message: 'Do not use `as never`. Use a typed session adapter if auth event types mismatch.',
    }],
  },
})
