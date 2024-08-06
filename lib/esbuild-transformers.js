import { build, transform, formatMessages } from 'esbuild'

function convertMap(map) {
  if (!map) return false
  return map === true || map.inline !== false ? 'inline' : 'external'
}

async function convertWarnings(warnings) {
  const messages = await formatMessages(warnings, { kind: 'warning', color: true })
  return warnings.map(({ text, location = {} }, i) => ({
    message: messages[i],
    reason: text,
    location: {
      column: location.column,
      line: location.line
    }
  }))
}

async function convertTransform({ code: css, map, from, warnings }) {
  if (warnings.length > 0) {
    warnings = await convertWarnings(warnings)
  }
  if (map) css += `/*# sourceMappingURL=${from}.map */`
  return { css, map, warnings }
}

function convertBundle({ outputFiles, from, warnings }) {
  let code
  let map
  for (const { path, text } of outputFiles) {
    if (path.endsWith('.map')) map = text
    else code = text
  }
  return convertTransform({ code, map, from, warnings })
}

export function createEsbuildMinifier({ map: defaultMap } = {}) {
  return {
    async process(contents, { from, map: inputMap = defaultMap } = {}) {
      const { code, map, warnings } = await transform(contents, {
        loader: 'css',
        minify: true,
        legalComments: 'none',
        sourcefile: from,
        sourcemap: convertMap(inputMap)
      })
      return convertTransform({ code, map, from, warnings })
    }
  }
}

export const esbuildMinifier = createEsbuildMinifier()

export function createEsbuildInliner({ map: defaultMap, resolveDir: defaultDir } = {}) {
  return {
    async process(contents, { from, map: inputMap = defaultMap, resolveDir = defaultDir } = {}) {
      const { outputFiles, warnings } = await build({
        stdin: {
          contents,
          sourcefile: from,
          resolveDir: resolveDir || process.cwd(),
          loader: 'css'
        },
        outdir: '.',
        bundle: true,
        write: false,
        sourcemap: convertMap(inputMap)
      })
      return convertBundle({ outputFiles, from, warnings })
    }
  }
}

export const esbuildInliner = createEsbuildInliner()

export function createEsbuildMinifyInliner({ map: defaultMap, resolveDir: defaultDir } = {}) {
  return {
    async process(contents, { from, map: inputMap = defaultMap, resolveDir = defaultDir } = {}) {
      const { outputFiles, warnings } = await build({
        stdin: {
          contents,
          sourcefile: from,
          resolveDir: resolveDir || process.cwd(),
          loader: 'css'
        },
        outdir: '.',
        bundle: true,
        write: false,
        minify: true,
        legalComments: 'none',
        sourcemap: convertMap(inputMap)
      })
      return convertBundle({ outputFiles, from, warnings })
    }
  }
}

export const esbuildMinifyInliner = createEsbuildMinifyInliner()
