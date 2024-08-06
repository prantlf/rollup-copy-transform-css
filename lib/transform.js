import { writeFile } from 'node:fs/promises'
import { basename, join } from 'node:path'
import matches from './filter.js'
import createProcessor from './processor.js'

export default function createTransform({ minify, inline, plugins, map: defaultMap, filter: defaultFilter } = {}) {
  const processor = createProcessor({ minify, inline, plugins })
  return async (contents, filename, { map = defaultMap, filter = defaultFilter } = {}) => {
    if (!matches(filename, filter)) return contents
    if (map === true) {
      map = { inline: true }
    }
    if (map && map.inline === undefined) {
      map.inline = true
    }
    let { css, map: outputMap, warnings } = await processor.process(contents, { from: filename, map })
    if (warnings?.length) {
      for (const { message } of warnings) console.warn(message)
      throw new Error('Transformation failed')
    }
    if (outputMap) {
      const { dir, pathTransform } = map
      if (dir) {
        filename = join(dir, basename(filename))
      }
      const mapPath =`${filename}.map`
      if (pathTransform) {
        outputMap = typeof outputMap !== 'string' ? outputMap.toJSON() : JSON.parse(outputMap)
        const { sources } = outputMap
        for (let i = 0, l = sources.length; i < l; ++i) {
          sources[i] = pathTransform(sources[i], mapPath)
        }
      }
      if (typeof outputMap !== 'string') outputMap = JSON.stringify(outputMap)
      await writeFile(mapPath, outputMap);
    }
    return css
  }
}
