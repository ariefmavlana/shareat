import withNuxt from './.nuxt/eslint.config.mjs'
export default withNuxt(
  {
    ignores: ['referensi/**', 'docs/**', 'drizzle/**', '.data/**', '.local/**'],
  },
  {
    rules: {
      'vue/html-self-closing': [
        'error',
        {
          html: { void: 'always', normal: 'any', component: 'always' },
          svg: 'always',
          math: 'always',
        },
      ],
    },
  },
)
