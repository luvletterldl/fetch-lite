import antfu from '@antfu/eslint-config'

export default antfu({
  ignores: [
    '**/*.md',
    '**/*.js',
    '**/*.wasm',
  ],
}, {
  rules: {
    'prefer-promise-reject-errors': 'off',
    'no-console': 0,
    'pnpm/yaml-enforce-settings': 0,
  },
})
