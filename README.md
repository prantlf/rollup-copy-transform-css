# rollup-copy-transform-css

[![Latest version](https://img.shields.io/npm/v/rollup-copy-transform-css)
 ![Dependency status](https://img.shields.io/librariesio/release/npm/rollup-copy-transform-css)
](https://www.npmjs.com/package/rollup-copy-transform-css)
[![Coverage](https://codecov.io/gh/prantlf/rollup-copy-transform-css/branch/master/graph/badge.svg)](https://codecov.io/gh/prantlf/rollup-copy-transform-css)

Inlining, minifying and other methods for transforming stylesheets when copying them with [rollup-plugin-copy].

## Synopsis

```js
import copy from 'rollup-plugin-copy';
import { createTransform } from 'rollup-copy-transform-css';

export default {
  plugins: [
    copy({
      targets: [{
        src: 'src/main.css',
        dest: 'dist',
        transform: createTransform({ inline: true, minify: true })
      }]
    })
  ]
  // the rest of the configuration
}
```

## Installation

Make sure that you use [Node.js] 14 or newer and [Rollup] 2 or newer. Use your favourite package manager - [NPM], [PNPM] or [Yarn]:

```sh
npm i -D rollup-copy-transform-css
pnpm i -D rollup-copy-transform-css
yarn add -D rollup-copy-transform-css
```

## Usage

Edit a `rollup.config.js` [configuration file], import the `createTransform` function, call it to create a transformation method and assign it to the `transform` property of the copy target options:

```js
import copy from 'rollup-plugin-copy';
import { createTransform } from 'rollup-copy-transform-css';

const transformCss = createTransform({
  inline: true, minify: true, map: { inline: false }
})

export default {
  input: 'src/index.js',
  output: { file: 'dist/main.js', format: 'iife', sourcemap: true },
  plugins: [
    copy({
      targets: [{
        src: 'src/main.css', dest: 'dist', transform: transformCss
      }]
    })
  ]
}
```

Then call `rollup` either via the [command-line] or [programmatically].

## Creation Options

The following options can be passed in an object to the `createTransform` function. Either minifying or inlining or both or custom plugins have to be provided:

### `minify`

Type: `Boolean | Object`<br>
Default: `false`

Enables minifying. If an object is specified, it will be passed to the [cssnano] plugin.

### `inline`

Type: `Boolean | Object`<br>
Default: `false`

Enables inlining of stylesheets and other assets. If an object is specified, it will have to include two properties pointing to objects: `{ stylesheets, assets }`. The `stylesheets` objects will be passed to the [postcss-import] plugin. The `assets` objects will be passed to the [postcss-url] plugin.

### `plugins`

Type: `Array<Object>`<br>
Default: `undefined`

An array of [PostCSS] plugins to fully customise the transformation.

### `filter`

Type: `String | Array<String> | Function`<br>
Default: `undefined`

[Pattern] to match files which will be processed by the `transform` function. Can be passed to the `transform` function too.

### `map`

Type: `Boolean | Object`<br>
Default: `false`

Controls the generation of a source map. Can be passed to the `transform` function too.

If set to `true`, an inline source map will be included in the output stylesheet. If set to an object, [options supported by PostCSS for source maps] can be included, with the following extras:

| Property        | Default      | Description |
| :-------------- | :----------- | :---------- |
| `inline`        | `true`       | Appends the source map to the output stylesheet. If set to `false` the source map will be written to an external file. |
| `dir`           | `undefined`  | Target directory for the external source map. If not set, the `.map` extension will be just appended to the stylesheet file name. |
| `pathTransform` | `undefined`  | Allows changing the paths in `sources` in the source map. |

The prototype of `pathTransform` is:

```ts
pathTransform(source: string, mapPath: string): string
```

It is supposed to adapt the `source` path and return it.

## Usage Options

The prototype of created `transform` method fits the [`transform` method for `rollup-plugin-copy`], with an optional `options` object to override the defaults passed to `createTransform`:

```ts
transform(contents: string, filename: string, options?: object): string
```

The options may contain `map` and `filter` properties described above.

An example how to use the options:

```js
const transformCss = createTransform({ inline: true, minify: true })

  ...

  targets: [{
    src: 'src/main.css',
    dest: 'dist',
    transform: (contents, filename) =>
      transformCss(contents, filename, { map: true })
  }]
```

## How It Works

Uses [PostCSS] to process the contents of the stylesheet. The minifying is performed by the [cssnano] plugin. Inlining of other stylesheets imported by the `@import` directives is performed by the [postcss-import] plugin. Inlining of other assets like pictures referred to by absolute or relative URLs is performed by the [postcss-url] plugin. If an error occurs during the transformation, the whole bundling operation will fail, using the [postcss-fail-on-warn] plugin.

Passing booleans to the `createTransform` function - `{ minify: true, inline: true }` - will use the defaults. You can override them by passing an object instead of `true`:

```js
{
  minify: {
    preset: ['default', { discardComments: { removeAll: true } }]
  },
  inline: {
    stylesheets: {},
    assets: { url: 'inline' }
  }
}
```

Pass [options for cssnano] to `minify`, [options for postcss-import] to `inline.stylesheets` and [options for postcss-url] to `inline.assets`.

## Contributing

In lieu of a formal styleguide, take care to maintain the existing coding style. Lint and test your code.

## License

Copyright (C) 2022 Ferdinand Prantl

Licensed under the [MIT License].

[MIT License]: http://en.wikipedia.org/wiki/MIT_License
[Rollup]: https://rollupjs.org/
[Node.js]: https://nodejs.org/
[NPM]: https://www.npmjs.com/
[PNPM]: https://pnpm.io/
[Yarn]: https://yarnpkg.com/
[configuration file]: https://www.rollupjs.org/guide/en/#configuration-files
[command-line]: https://www.rollupjs.org/guide/en/#command-line-reference
[programmatically]: https://www.rollupjs.org/guide/en/#javascript-api
[Pattern]: https://www.linuxjournal.com/content/bash-extended-globbing
[PostCSS]: https://postcss.org/
[cssnano]: https://cssnano.co/
[rollup-plugin-copy]: https://www.npmjs.com/package/rollup-plugin-copy
[postcss-import]: https://www.npmjs.com/package/postcss-import
[postcss-url]: https://www.npmjs.com/package/postcss-url
[postcss-fail-on-warn]: https://www.npmjs.com/package/postcss-fail-on-warn
[options supported by PostCSS for source maps]: https://postcss.org/api/#sourcemapoptions
[`transform` method for `rollup-plugin-copy`]: https://github.com/vladshcherbin/rollup-plugin-copy#transform-file-contents
[options for cssnano]: https://cssnano.co/docs/config-file/
[options for postcss-import]: https://github.com/postcss/postcss-import#options
[options for postcss-url]: https://github.com/postcss/postcss-url#options-combinations
