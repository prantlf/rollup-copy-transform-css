import { writeFile } from 'fs/promises'
import { basename, join } from 'path'
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
    let { css, map: outputMap } = await processor.process(contents, { from: filename, map })
    if (outputMap) {
      const { dir, pathTransform } = map
      if (dir) {
        filename = join(dir, basename(filename))
      }
      const mapPath =`${filename}.map`
      outputMap = outputMap.toJSON()
      if (pathTransform) {
        const { sources } = outputMap
        for (let i = 0, l = sources.length; i < l; ++i) {
          sources[i] = pathTransform(sources[i], mapPath)
        }
      }
      await writeFile(mapPath, JSON.stringify(outputMap));
    }
    return css
  }
}
