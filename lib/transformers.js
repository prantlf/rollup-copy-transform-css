import postcss from 'postcss'
import cssnano from 'cssnano'
import inline from 'postcss-import'
import url from 'postcss-url'
import failOnWarn from 'postcss-fail-on-warn'

const minifyOptions = {
  preset: ['default', { discardComments: { removeAll: true } }]
}

export function createMinifier(options = minifyOptions) {
  return postcss([cssnano(options), failOnWarn])
}

export const minifier = createMinifier()

const assetOptions = { url: 'inline' }

export function createInliner({ stylesheets, assets = assetOptions } = {}) {
  return postcss([inline(stylesheets), url(assets), failOnWarn])
}

export const inliner = createInliner()

export function createMinifyInliner({ minify = minifyOptions, inlineStylesheets, inlineAssets = assetOptions } = {}) {
  return postcss([
    inline(inlineStylesheets),
    url(inlineAssets),
    cssnano(minify),
    failOnWarn
  ])
}

export const minifyInliner = createMinifyInliner()
