import postcss from 'postcss'
import {
  minifier, inliner, minifyInliner,
  createMinifyInliner, createMinifier, createInliner
} from './transformers.js'
import {
  esbuildMinifier, esbuildInliner, esbuildMinifyInliner
} from './esbuild-transformers.js'

export default function createProcessor({ minify, inline, plugins } = {}) {
  if (plugins) return postcss(plugins)
  if (minify && inline) {
    if (minify === true && inline === true) return minifyInliner
    if (minify.fast || inline.fast) return esbuildMinifyInliner
    const { stylesheets, assets } = inline
    return createMinifyInliner({
      minify, inlineStylesheets: stylesheets, inlineAssets: assets
    })
  }if (minify) {
    if (minify === true) return minifier
    if (minify.fast) return esbuildMinifier
    return createMinifier(minify)
  }
  if (inline) {
    if (inline === true) return inliner
    if (inline.fast) return esbuildInliner
    return createInliner(inline)
  }
  throw new Error('Neither minify nor inline nor plugins were set')
}
