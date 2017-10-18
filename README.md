# convert-svg-to-png

A [Node.js](https://nodejs.org) module for converting SVG to PNG using headless Chromium.

[![Build Status](https://img.shields.io/codeship/0a4c5630-9648-0135-1042-7e44d22860e0/develop.svg?style=flat-square)](https://app.codeship.com/projects/251525)
[![Dependency Status](https://img.shields.io/david/NotNinja/convert-svg-to-png.svg?style=flat-square)](https://david-dm.org/NotNinja/convert-svg-to-png)
[![Dev Dependency Status](https://img.shields.io/david/dev/NotNinja/convert-svg-to-png.svg?style=flat-square)](https://david-dm.org/NotNinja/convert-svg-to-png?type=dev)
[![License](https://img.shields.io/npm/l/convert-svg-to-png.svg?style=flat-square)](https://github.com/NotNinja/convert-svg-to-png/blob/master/LICENSE.md)
[![Release](https://img.shields.io/npm/v/convert-svg-to-png.svg?style=flat-square)](https://www.npmjs.com/package/convert-svg-to-png)

* [Install](#install)
* [API](#api)
* [Bugs](#bugs)
* [Contributors](#contributors)
* [License](#license)

## Install

Install using [npm](https://www.npmjs.com):

``` bash
$ npm install --save convert-svg-to-png
```

You'll need to have at least [Node.js](https://nodejs.org) 8 or newer.

## API

### `convert(source[, options])`

Converts the specified `source` SVG into a PNG using the `options` provided via a headless Chromium instance.

`source` can either be a SVG buffer or string.

If the width and/or height cannot be derived from `source` then they must be provided via their corresponding options.
This method attempts to derive the dimensions from `source` via any `width`/`height` attributes or its calculated
`viewBox` attribute.

An error will occur if `source` does not contain an SVG element or no `width` and/or `height` options were provided and
this information could not be derived from `source`.

#### Options

| Option     | Type          | Default                 | Description |
| ---------- | ------------- | ----------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| `baseFile` | String        | N/A                     | Path of file to be converted into a file URL to use for all relative URLs contained within SVG. Overrides `baseUrl` option. |
| `baseUrl`  | String        | `"file:///path/to/cwd"` | Base URL to use for all relative URLs contained within SVG. Overridden by `baseUrl` option.                                 |
| `height`   | Number/String | N/A                     | Height of the PNG to be generated. Derived from SVG source if omitted.                                                      |
| `width`    | Number/String | N/A                     | Width of the PNG to be generated. Derived from SVG source if omitted.                                                       |

#### Example

``` javascript
const { convert } = require('convert-svg-to-png');
const fs = require('fs');
const path = require('path');
const util = require('util');

const readFile = util.promisify(fs.readFile);
const writeFile = util.promisify(fs.writeFile);

async function convertSvgFile(filePath) {
  const dirPath = path.dirname(filePath);
  const input = await readFile(filePath);
  const output = await convert(input, { baseFile: dirPath });

  await writeFile(path.join(dirPath, `${path.basename(filePath, '.svg')}.png`), output);
}
```

### `createConverter()`

Creates an instance of `Converter`.

It is important to note that, after the first time `Converter#convert` is called, a headless Chromium instance will
remain open until `Converter#destroy` is called. This is done automatically when using the main API
[convert](#convertsource-options) method, however, when using `Converter` directly, it is the responsibility of the
caller. Due to the fact that creating browser instances is expensive, this level of control allows callers to reuse a
browser for multiple conversions. It's not recommended to keep an instance around for too long, as it will use up
resources.

#### Example

``` javascript
const { createConverter } = require('convert-svg-to-png');
const fs = require('fs');
const path = require('path');
const util = require('util');

const readdir = util.promisify(fs.readdir);
const readFile = util.promisify(fs.readFile);
const writeFile = util.promisify(fs.writeFile);

async function convertSvgFiles(dirPath) {
  const converter = createConverter();

  try {
    const filePaths = await readdir(dirPath);

    for (const filePath of filePaths) {
      const extension = path.extname(filePath);
      if (extension !== '.svg') {
        continue;
      }

      const input = await readFile(path.join(dirPath, filePath));
      const output = await converter.convert(input, { baseFile: dirPath });

      await writeFile(path.join(dirPath, `${path.basename(filePath, extension)}.png`), output);
    }
  } finally {
    await converter.destroy();
  }
}
```

### `version`

The current version of this library.

#### Example

``` javascript
const { version } = require('convert-svg-to-png');

version;
//=> "0.1.0"
```

## Bugs

If you have any problems with this library or would like to see changes currently in development you can do so
[here](https://github.com/NotNinja/convert-svg-to-png/issues).

## Contributors

If you want to contribute, you're a legend! Information on how you can do so can be found in
[CONTRIBUTING.md](https://github.com/NotNinja/convert-svg-to-png/blob/master/CONTRIBUTING.md). We want your suggestions
and pull requests!

A list of all contributors can be found in
[AUTHORS.md](https://github.com/NotNinja/convert-svg-to-png/blob/master/AUTHORS.md).

## License

See [LICENSE.md](https://github.com/NotNinja/convert-svg-to-png/raw/master/LICENSE.md) for more information on our MIT
license.

[![Copyright !ninja](https://cdn.rawgit.com/NotNinja/branding/master/assets/copyright/base/not-ninja-copyright-186x25.png)](https://not.ninja)
