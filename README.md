# convert-svg-to-png

A [Node.js](https://nodejs.org) module for converting SVG to PNG using headless Chromium.

[![Build Status](https://img.shields.io/travis/NotNinja/convert-svg-to-png/develop.svg?style=flat-square)](https://travis-ci.org/NotNinja/convert-svg-to-png)
[![Dependency Status](https://img.shields.io/david/NotNinja/convert-svg-to-png.svg?style=flat-square)](https://david-dm.org/NotNinja/convert-svg-to-png)
[![Dev Dependency Status](https://img.shields.io/david/dev/NotNinja/convert-svg-to-png.svg?style=flat-square)](https://david-dm.org/NotNinja/convert-svg-to-png?type=dev)
[![License](https://img.shields.io/npm/l/convert-svg-to-png.svg?style=flat-square)](https://github.com/NotNinja/convert-svg-to-png/blob/master/LICENSE.md)
[![Release](https://img.shields.io/npm/v/convert-svg-to-png.svg?style=flat-square)](https://www.npmjs.com/package/convert-svg-to-png)

* [Install](#install)
* [CLI](#cli)
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

If you want to use the command line interface you'll most likely want to install it globally so that you can run
`convert-svg-to-png` from anywhere:

``` bash
$ npm install --global convert-svg-to-png
```

## CLI

    Usage: convert-svg-to-png [options] [files...]


      Options:

        -V, --version              output the version number
        --no-color                 disables color output
        -b, --base-url <url>       specify base URL to use for all relative URLs in SVG
        -f, --filename <filename>  specify filename the for PNG output when processing STDIN
        --height <value>           specify height for PNG
        --width <value>            specify width for PNG
        -h, --help                 output usage information

## API

### `convert(input[, options])`

Converts the specified `input` SVG into a PNG using the `options` provided via a headless Chromium instance.

`input` can either be a SVG buffer or string.

If the width and/or height cannot be derived from `input` then they must be provided via their corresponding options.
This method attempts to derive the dimensions from `input` via any `width`/`height` attributes or its calculated
`viewBox` attribute.

This method is resolved with the PNG buffer.

An error will occur if `input` does not contain an SVG element or no `width` and/or `height` options were provided and
this information could not be derived from `input`.

#### Options

| Option     | Type          | Default                 | Description                                                                                                                 |
| ---------- | ------------- | ----------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| `baseFile` | String        | N/A                     | Path of file to be converted into a file URL to use for all relative URLs contained within SVG. Overrides `baseUrl` option. |
| `baseUrl`  | String        | `"file:///path/to/cwd"` | Base URL to use for all relative URLs contained within SVG. Overridden by `baseUrl` option.                                 |
| `height`   | Number/String | N/A                     | Height of the PNG to be generated. Derived from SVG input if omitted.                                                       |
| `scale`    | Number        | `1`                     | Scale to be applied to the width and height (specified as options or derived)                                               |
| `width`    | Number/String | N/A                     | Width of the PNG to be generated. Derived from SVG input if omitted.                                                        |

#### Example

``` javascript
const Converter = require('convert-svg-to-png');
const express = require('express');

const app = express();

app.post('/convert', async(req, res) => {
  const png = await Converter.convert(req.body);

  res.set('Content-Type', 'image/png');
  res.send(png);
});

app.listen(3000);
```

### `convertFile(inputFilePath[, options])`

Converts the SVG file at the specified path into a PNG using the `options` provided and writes it to the the output
file.

The output file is derived from `inputFilePath` unless the `outputFilePath` option is specified.

If the width and/or height cannot be derived from the input file then they must be provided via their corresponding
options. This method attempts to derive the dimensions from the input file via any `width`/`height` attributes or its
calculated `viewBox` attribute.

This method is resolved with the path of the (PNG) output file for reference.

An error will occur if the input file does not contain an SVG element, no `width` and/or `height` options were provided
and this information could not be derived from input file, or a problem arises while reading the input file or writing
the output file.

#### Options

Has the same options as the standard `convert` method but also supports the following additional options:

| Option           | Type   | Default                                               | Description                                                   |
| ---------------- | ------ | ----------------------------------------------------- | ------------------------------------------------------------- |
| `outputFilePath` | String | `inputFilePath` with extension replaced with `".png"` | Path of the file to which the PNG output should be written to |

#### Example

``` javascript
const Converter = require('convert-svg-to-png');

(async() => {
  const inputFilePath = '/path/to/my-image.svg';
  const outputFilePath = await Converter.convertFile(inputFilePath);

  console.log(outputFilePath);
  //=> "/path/to/my-image.png"
})();
```

### `Converter`

Creates an instance of `Converter`.

It is important to note that, after the first time either `Converter#convert` or `Converter#convertFile` are called, a
headless Chromium instance will remain open until `Converter#destroy` is called. This is done automatically when using
the main API convert methods, however, when using `Converter` directly, it is the responsibility of the caller. Due to
the fact that creating browser instances is expensive, this level of control allows callers to reuse a browser for
multiple conversions. It's not recommended to keep an instance around for too long, as it will use up resources.

#### Example

``` javascript
const Converter = require('convert-svg-to-png');
const fs = require('fs');
const util = require('util');

const readdir = util.promisify(fs.readdir);

async function convertSvgFiles(dirPath) {
  const converter = new Converter();

  try {
    const filePaths = await readdir(dirPath);

    for (const filePath of filePaths) {
      await converter.convertFile(filePath);
    }
  } finally {
    await converter.destroy();
  }
}
```

### `VERSION`

The current version of this library.

#### Example

``` javascript
const Converter = require('convert-svg-to-png');

console.log(Converter.VERSION);
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
