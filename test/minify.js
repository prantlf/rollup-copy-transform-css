import { fail, strictEqual } from 'node:assert'
import { fileURLToPath } from 'node:url'
import { access, readFile, unlink } from 'node:fs/promises'
import tehanu from 'tehanu'
import { createTransform } from '../lib/index.js'

const test = tehanu(fileURLToPath(import.meta.url))
const minifyCss = createTransform({ minify: true })

test.before(async () => {
  try {
    await access('test/flex-body.css.map')
    await unlink('test/flex-body.css.map')
  // eslint-disable-next-line no-empty
  } catch {}
})

test('minifies without source map by default', async () => {
  const css = await minifyCss('body { display: flex }')
  strictEqual(css, 'body{display:flex}')
})

test('minifies with an inline source map', async () => {
  const css = await minifyCss('body { display: flex }', 'flex-body.css', {
    map: {}, filter: '*.css'
  })
  strictEqual(css, `body{display:flex}
/*# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImZsZXgtYm9keS5jc3MiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsS0FBTyxZQUFjIiwiZmlsZSI6ImZsZXgtYm9keS5jc3MiLCJzb3VyY2VzQ29udGVudCI6WyJib2R5IHsgZGlzcGxheTogZmxleCB9Il19 */`)
})

test('minifies with an external source map', async () => {
  const css = await minifyCss('body { display: flex }', 'flex-body.css', {
    map: { inline: false, dir: 'test', pathTransform: source => `test/${source}` }
  })
  strictEqual(css, `body{display:flex}
/*# sourceMappingURL=flex-body.css.map */`)
  const map = await readFile('test/flex-body.css.map', 'utf8')
  strictEqual(map, '{"version":3,"sources":["test/flex-body.css"],"names":[],"mappings":"AAAA,KAAO,YAAc","file":"flex-body.css","sourcesContent":["body { display: flex }"]}')
})

test('handles broken input', async () => {
  try {
    await minifyCss('body {')
    fail('processed broken input')
  } catch ({ reason }) {
    strictEqual(reason, ('Unclosed block'))
  }
})

test('handles missing transformations', () => {
  try {
    createTransform()
    fail('accepted empty transformations')
  } catch ({ message }) {
    strictEqual(message, 'Neither minify nor inline nor plugins were set')
  }
})

test('supports custom transformations', async () => {
  const transform = createTransform({ minify: {} })
  const css = await transform('body { display: flex }')
  strictEqual(css, 'body{display:flex}')
})

test('supports fully custom transformations', async () => {
  const transform = createTransform({ plugins: [] })
  const css = await transform('body { display: flex }')
  strictEqual(css, 'body { display: flex }')
})

test('filters out file names', async () => {
  const css = await minifyCss('body { display: flex }', 'flex-body.css', {
    filter: () => false
  })
  strictEqual(css, 'body { display: flex }')
})
