import { fail, strictEqual } from 'assert'
import { fileURLToPath } from 'url'
import { access, readFile, unlink } from 'fs/promises'
import tehanu from 'tehanu'
import { createTransform } from '../lib/index.js'

const test = tehanu(fileURLToPath(import.meta.url))
const inminCss = createTransform({ inline: true, minify: true })

test.before(async () => {
  try {
    await access('test/flex-body.css.map')
    await unlink('test/flex-body.css.map')
  // eslint-disable-next-line no-empty
  } catch {}
})

test('inlines and minifies without source map by default', async () => {
  const css = await inminCss('@import "test/controls.css"; body { display: flex }')
  strictEqual(css, '.control,body{display:flex}')
})

test('inlines and minifies with an inline source map', async () => {
  const css = await inminCss('@import "test/controls.css"; body { display: flex }', 'flex-body.css', { map: true })
  strictEqual(css, `.control,body{display:flex}
/*# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImZsZXgtYm9keS5jc3MiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQTZCLGNBQU8sWUFBYyIsImZpbGUiOiJmbGV4LWJvZHkuY3NzIiwic291cmNlc0NvbnRlbnQiOlsiQGltcG9ydCBcInRlc3QvY29udHJvbHMuY3NzXCI7IGJvZHkgeyBkaXNwbGF5OiBmbGV4IH0iXX0= */`)
})

test('inlines and minifies with an external source map', async () => {
  const css = await inminCss('@import "test/controls.css"; body { display: flex }', 'flex-body.css', {
    map: { inline: false, dir: 'test' }
  })
  strictEqual(css, `.control,body{display:flex}
/*# sourceMappingURL=flex-body.css.map */`)
  const map = await readFile('test/flex-body.css.map', 'utf8')
  strictEqual(map, '{"version":3,"sources":["flex-body.css"],"names":[],"mappings":"AAA6B,cAAO,YAAc","file":"flex-body.css","sourcesContent":["@import \\"test/controls.css\\"; body { display: flex }"]}')
})

test('handles broken input', async () => {
  try {
    await inminCss('body {')
    fail('processed broken input')
  } catch ({ reason }) {
    strictEqual(reason, ('Unclosed block'))
  }
})

test('supports custom transformation', async () => {
  const transform = createTransform({
    minify: {}, inline: { assets: { url: 'inline' } }
  })
  const css = await transform('body { display: flex }')
  strictEqual(css, 'body{display:flex}')
})
