import postcss from 'postcss'
import {
  minifier, inliner, minifyInliner,
  createMinifyInliner, createMinifier, createInliner
} from './transformers.js'

export default function createProcessor({ minify, inline, plugins } = {}) {
  let processor
  if (plugins) {
    processor = postcss(plugins)
  } else if (minify && inline) {
    if (minify === true && inline === true) {
      processor = minifyInliner
    } else {
      const { stylesheets, assets } = inline
      processor = createMinifyInliner({
        minify, inlineStylesheets: stylesheets, inlineAssets: assets
      })
    }
  } else if (minify) {
    processor = minify === true ? minifier : createMinifier(minify)
  } else if (inline) {
    processor = inline === true ? inliner : createInliner(inline)
  } else {
    throw new Error('Neither minify nor inline was set')
  }
  return processor
}
