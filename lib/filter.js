import picomatch from 'picomatch'

export default function matches(filename, filter) {
  if (typeof filter === 'function') return filter(filename)
  return !filter || picomatch.isMatch(filename, filter)
}
