import { fail, strictEqual } from 'assert'
import { fileURLToPath } from 'url'
import { access, readFile, unlink } from 'fs/promises'
import tehanu from 'tehanu'
import { createTransform } from '../lib/index.js'

const test = tehanu(fileURLToPath(import.meta.url))
const inminCss = createTransform({ inline: { fast: true }, minify: true })

test.before(async () => {
  try {
    await access('test/flex-body.css.map')
    await unlink('test/flex-body.css.map')
  // eslint-disable-next-line no-empty
  } catch {}
})

test('inlines and minifies without source map by default', async () => {
  const css = await inminCss('@import "test/controls.css"; body { display: flex }')
  strictEqual(css, `.control{display:flex}body{display:flex}
`)
})

test('inlines and minifies with an inline source map', async () => {
  const css = await inminCss('@import "test/controls.css"; body { display: flex }', 'flex-body.css', { map: true })
  strictEqual(css, `.control{display:flex}body{display:flex}
/*# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidGVzdC9jb250cm9scy5jc3MiLCAiZmxleC1ib2R5LmNzcyJdLAogICJzb3VyY2VzQ29udGVudCI6IFsiLmNvbnRyb2wgeyBkaXNwbGF5OiBmbGV4IH1cbiIsICJAaW1wb3J0IFwidGVzdC9jb250cm9scy5jc3NcIjsgYm9keSB7IGRpc3BsYXk6IGZsZXggfSJdLAogICJtYXBwaW5ncyI6ICJBQUFBLFNBQVcsYUNBa0IsS0FBTyIsCiAgIm5hbWVzIjogW10KfQo= */
`)
})

test('inlines and minifies with an external source map', async () => {
  const css = await inminCss('@import "test/controls.css"; body { display: flex }', 'flex-body.css', {
    map: { inline: false, dir: 'test' }
  })
  strictEqual(css, `.control{display:flex}body{display:flex}
/*# sourceMappingURL=flex-body.css.map */`)
  const map = await readFile('test/flex-body.css.map', 'utf8')
  strictEqual(map, `{
  "version": 3,
  "sources": ["test/controls.css", "flex-body.css"],
  "sourcesContent": [".control { display: flex }\\n", "@import \\"test/controls.css\\"; body { display: flex }"],
  "mappings": "AAAA,SAAW,aCAkB,KAAO",
  "names": []
}
`)
})

test('handles broken input', async () => {
  try {
    await inminCss('body {')
    fail('processed broken input')
  } catch ({ message }) {
    strictEqual(message, ('Transformation failed'))
  }
})

test('supports custom transformation', async () => {
  const transform = createTransform({
    minify: {}, inline: { assets: { url: 'inline' } }
  })
  const css = await transform('body { display: flex }')
  strictEqual(css, 'body{display:flex}')
})
