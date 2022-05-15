import builtins from 'builtin-modules/static'

export default {
  input: 'lib/index.js',
  output: { file: 'lib/index.cjs', format: 'cjs', sourcemap: true },
  external: [
    ...builtins, 'cssnano', 'fs/promises', 'picomatch', 'postcss',
    'postcss-fail-on-warn', 'postcss-import', 'postcss-url'
  ]
}
