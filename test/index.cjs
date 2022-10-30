const { strictEqual } = require('assert')
const test = require('tehanu')(__filename)
const {
  createMinifier, createInliner, createMinifyInliner,
  minifier, inliner, minifyInliner,
  createProcessor, createTransform
} = require('rollup-copy-transform-css')

test('exports', () => {
  strictEqual(typeof createMinifier, 'function')
  strictEqual(typeof createInliner, 'function')
  strictEqual(typeof createMinifyInliner, 'function')
  strictEqual(typeof minifier, 'object')
  strictEqual(typeof inliner, 'object')
  strictEqual(typeof minifyInliner, 'object')
  strictEqual(typeof createProcessor, 'function')
  strictEqual(typeof createTransform, 'function')
})
