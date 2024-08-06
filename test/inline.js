import { fail, strictEqual } from 'node:assert'
import { fileURLToPath } from 'node:url'
import { access, readFile, unlink } from 'node:fs/promises'
import tehanu from 'tehanu'
import { createTransform } from '../lib/index.js'

const test = tehanu(fileURLToPath(import.meta.url))
const inlineCss = createTransform({ inline: true })

test.before(async () => {
  try {
    await access('test/flex-body.css.map')
    await unlink('test/flex-body.css.map')
  // eslint-disable-next-line no-empty
  } catch {}
})

test('inlines without source map by default', async () => {
  const css = await inlineCss('@import "test/controls.css"; body { display: flex }')
  strictEqual(css, '.control { display: flex } body { display: flex }')
})

test('inlines with an inline source map', async () => {
  const css = await inlineCss('@import "test/controls.css"; body { display: flex }', 'flex-body.css', { map: true })
  strictEqual(css, `.control { display: flex } body { display: flex }
/*# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInRlc3QvY29udHJvbHMuY3NzIiwiZmxleC1ib2R5LmNzcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxXQUFXLGNBQWMsRUNBSSxPQUFPLGNBQWMiLCJmaWxlIjoiZmxleC1ib2R5LmNzcyIsInNvdXJjZXNDb250ZW50IjpbIi5jb250cm9sIHsgZGlzcGxheTogZmxleCB9XG4iLCJAaW1wb3J0IFwidGVzdC9jb250cm9scy5jc3NcIjsgYm9keSB7IGRpc3BsYXk6IGZsZXggfSJdfQ== */`)
})

test('inlines with an external source map', async () => {
  const css = await inlineCss('@import "test/controls.css"; body { display: flex }', 'flex-body.css', {
    map: { inline: false, dir: 'test' }
  })
  strictEqual(css, `.control { display: flex } body { display: flex }
/*# sourceMappingURL=flex-body.css.map */`)
  const map = await readFile('test/flex-body.css.map', 'utf8')
  strictEqual(map, '{"version":3,"sources":["test/controls.css","flex-body.css"],"names":[],"mappings":"AAAA,WAAW,cAAc,ECAI,OAAO,cAAc","file":"flex-body.css","sourcesContent":[".control { display: flex }\\n","@import \\"test/controls.css\\"; body { display: flex }"]}')
})

test('handles broken input', async () => {
  try {
    await inlineCss('body {')
    fail('processed broken input')
  } catch ({ reason }) {
    strictEqual(reason, ('Unclosed block'))
  }
})

test('supports custom transformation', async () => {
  const transform = createTransform({
    inline: { assets: { url: 'inline' } }
  })
  const css = await transform('body { display: flex }')
  strictEqual(css, 'body { display: flex }')
})
