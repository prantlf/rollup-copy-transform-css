import { fail, strictEqual } from 'assert'
import { fileURLToPath } from 'url'
import { access, readFile, unlink } from 'fs/promises'
import tehanu from 'tehanu'
import { createTransform } from '../lib/index.js'

const test = tehanu(fileURLToPath(import.meta.url))
const minifyCss = createTransform({ minify: { fast: true } })

test.before(async () => {
  try {
    await access('test/flex-body.css.map')
    await unlink('test/flex-body.css.map')
  // eslint-disable-next-line no-empty
  } catch {}
})

test('minifies without source map by default', async () => {
  const css = await minifyCss('body { display: flex }')
  strictEqual(css, 'body{display:flex}\n')
})

test('minifies with an inline source map', async () => {
  const css = await minifyCss('body { display: flex }', 'flex-body.css', {
    map: {}, filter: '*.css'
  })
  strictEqual(css, `body{display:flex}
/*# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiZmxleC1ib2R5LmNzcyJdLAogICJzb3VyY2VzQ29udGVudCI6IFsiYm9keSB7IGRpc3BsYXk6IGZsZXggfSJdLAogICJtYXBwaW5ncyI6ICJBQUFBLEtBQU8iLAogICJuYW1lcyI6IFtdCn0K */
`)
})

test('minifies with an external source map', async () => {
  const css = await minifyCss('body { display: flex }', 'flex-body.css', {
    map: { inline: false, dir: 'test', pathTransform: source => `test/${source}` }
  })
  strictEqual(css, `body{display:flex}
/*# sourceMappingURL=flex-body.css.map */`)
  const map = await readFile('test/flex-body.css.map', 'utf8')
  strictEqual(map, '{"version":3,"sources":["test/flex-body.css"],"sourcesContent":["body { display: flex }"],"mappings":"AAAA,KAAO","names":[]}')
})

test('handles broken input', async () => {
  try {
    await minifyCss('body {')
    fail('processed broken input')
  } catch ({ message }) {
    strictEqual(message, ('Transformation failed'))
  }
})
