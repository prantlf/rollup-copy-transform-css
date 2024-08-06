import { builtinModules } from 'node:module'

export default {
  input: 'lib/index.js',
  output: { file: 'lib/index.cjs', format: 'cjs', sourcemap: true },
  external: [
    ...builtinModules, 'cssnano', 'esbuild', 'node:fs/promises', 'node:path',
    'picomatch', 'postcss', 'postcss-fail-on-warn', 'postcss-import', 'postcss-url'
  ]
}
