import builtins from 'builtin-modules/static.js'

export default {
  input: 'lib/index.js',
  output: { file: 'lib/index.cjs', format: 'cjs', sourcemap: true },
  external: [
    ...builtins, 'cssnano', 'esbuild', 'fs/promises', 'picomatch', 'postcss',
    'postcss-fail-on-warn', 'postcss-import', 'postcss-url'
  ]
}
