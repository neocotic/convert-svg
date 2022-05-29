# convert-svg-to-webp

A [Node.js](https://nodejs.org) package for converting SVG to WEBP using headless Chromium.

[![Build Status](https://img.shields.io/github/workflow/status/neocotic/convert-svg/CI/main?style=flat-square)](https://github.com/neocotic/convert-svg/actions/workflows/ci.yml)
[![License](https://img.shields.io/github/license/neocotic/convert-svg.svg?style=flat-square)](https://github.com/neocotic/convert-svg/blob/main/LICENSE.md)
[![Release](https://img.shields.io/github/release/neocotic/convert-svg.svg?style=flat-square)](https://github.com/neocotic/convert-svg/tree/main/packages/convert-svg-to-webp)

* [Install](#install)
* [CLI](#cli)
* [API](#api)
* [Other Formats](#other-formats)
* [Bugs](#bugs)
* [Contributors](#contributors)
* [License](#license)

## Install

Install using [npm](https://www.npmjs.com):

``` bash
$ npm install --save convert-svg-to-webp
```

You'll need to have at least [Node.js](https://nodejs.org) 12.20.0 or newer.

If you want to use the command line interface you'll most likely want to install it globally so that you can run
`convert-svg-to-webp` from anywhere:

``` bash
$ npm install --global convert-svg-to-webp
```

## CLI

    Usage: convert-svg-to-webp [options] [files...]


      Options:

        -V, --version          output the version number
        --no-color             disables color output
        --background <color>   specify background color for transparent regions in SVG
        --base-url <url>       specify base URL to use for all relative URLs in SVG
        --filename <filename>  specify filename for the WEBP output when processing STDIN
        --height <value>       specify height for WEBP
        --puppeteer <json>     specify a json object for puppeteer.launch options
        --rounding <type>      specify type of rounding to apply to dimensions
        --scale <value>        specify scale to apply to dimensions [1]
        --width <value>        specify width for WEBP
        -h, --help             output usage information

The CLI can be used in the following ways:

* Pass SVG files to be converted to WEBP files as command arguments
  * A [glob](https://www.npmjs.com/package/glob) pattern can be passed
  * Each converted SVG file will result in a corresponding WEBP with the same base file name (e.g.
    `image.svg -> image.webp`)
* Pipe SVG buffer to be converted to WEBP to command via STDIN
  * If the `--filename` option is passed, the WEBP will be written to a file resolved using its value
  * Otherwise, the WEBP will be streamed to STDOUT

## API

### `convert(input[, options])`

Converts the specified `input` SVG into a WEBP using the `options` provided via a headless Chromium instance.

`input` can either be a SVG buffer or string.

If the width and/or height cannot be derived from `input` then they must be provided via their corresponding options.
This method attempts to derive the dimensions from `input` via any `width`/`height` attributes or its calculated
`viewBox` attribute.

This method is resolved with the WEBP output buffer.

An error will occur if both the `baseFile` and `baseUrl` options have been provided, `input` does not contain an SVG
element or no `width` and/or `height` options were provided and this information could not be derived from `input`.

#### Options

| Option       | Type                   | Default                 | Description                                                                                                                                                      |
|--------------|------------------------|-------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `background` | String                 | N/A                     | Background color to be used to fill transparent regions within the SVG. Will remain transparent if omitted.                                                      |
| `baseFile`   | String                 | N/A                     | Path of the file to be converted into a file URL to use for all relative URLs contained within the SVG. Cannot be used in conjunction with the `baseUrl` option. |
| `baseUrl`    | String                 | `"file:///path/to/cwd"` | Base URL to use for all relative URLs contained within the SVG. Cannot be used in conjunction with the `baseFile` option.                                        |
| `height`     | Number/String          | N/A                     | Height of the output to be generated. Derived from SVG input if omitted.                                                                                         |
| `puppeteer`  | Object                 | N/A                     | Options that are to be passed directly to `puppeteer.launch` when creating the `Browser` instance.                                                               |
| `rounding`   | `ceil`/`floor`/`round` | `"round"`               | Type of rounding to be applied to the width and height.                                                                                                          |
| `scale`      | Number                 | `1`                     | Scale to be applied to the width and height (specified as options or derived).                                                                                   |
| `width`      | Number/String          | N/A                     | Width of the output to be generated. Derived from SVG input if omitted.                                                                                          |

The `puppeteer` option is not available when calling this method on a `Converter` instance created using
`createConverter`.

#### Example

``` javascript
const { convert } = require('convert-svg-to-webp');
const express = require('express');

const app = express();

app.post('/convert', async(req, res) => {
  const webp = await convert(req.body);

  res.set('Content-Type', 'image/webp');
  res.send(webp);
});

app.listen(3000);
```

### `convertFile(inputFilePath[, options])`

Converts the SVG file at the specified path into a WEBP using the `options` provided and writes it to the output file.

The output file is derived from `inputFilePath` unless the `outputFilePath` option is specified.

If the width and/or height cannot be derived from the input file then they must be provided via their corresponding
options. This method attempts to derive the dimensions from the input file via any `width`/`height` attributes or its
calculated `viewBox` attribute.

This method is resolved with the path of the WEBP output file for reference.

An error will occur if both the `baseFile` and `baseUrl` options have been provided, the input file does not contain an
SVG element, no `width` and/or `height` options were provided and this information could not be derived from input file,
or a problem arises while reading the input file or writing the output file.

#### Options

Has the same options as the standard `convert` method but also supports the following additional options:

| Option           | Type   | Default | Description                                                                                              |
|------------------|--------|---------|----------------------------------------------------------------------------------------------------------|
| `outputFilePath` | String | N/A     | Path of the file to which the WEBP output should be written to. Derived from input file path if omitted. |

#### Example

``` javascript
const { convertFile}  = require('convert-svg-to-webp');

(async() => {
  const inputFilePath = '/path/to/my-image.svg';
  const outputFilePath = await convertFile(inputFilePath);

  console.log(outputFilePath);
  //=> "/path/to/my-image.webp"
})();
```

### `createConverter([options])`

Creates an instance of `Converter` using the `options` provided.

It is important to note that, after the first time either `Converter#convert` or `Converter#convertFile` are called, a
headless Chromium instance will remain open until `Converter#destroy` is called. This is done automatically when using
the `API` convert methods, however, when using `Converter` directly, it is the responsibility of the caller. Due to the
fact that creating browser instances is expensive, this level of control allows callers to reuse a browser for multiple
conversions. It's not recommended to keep an instance around for too long, as it will use up resources.

#### Options

| Option      | Type   | Default | Description                                                                                        |
|-------------|--------|---------|----------------------------------------------------------------------------------------------------|
| `puppeteer` | Object | N/A     | Options that are to be passed directly to `puppeteer.launch` when creating the `Browser` instance. |

#### Example

``` javascript
const { createConverter } = require('convert-svg-to-webp');
const fs = require('fs');
const util = require('util');

const readdir = util.promisify(fs.readdir);

async function convertSvgFiles(dirPath) {
  const converter = createConverter();

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

## Other Formats

If you would like to convert an SVG into a format other than WEBP, check out our other converter packages below:

https://github.com/neocotic/convert-svg

## Bugs

If you have any problems with this package or would like to see changes currently in development you can do so
[here](https://github.com/neocotic/convert-svg/issues).

## Contributors

If you want to contribute, you're a legend! Information on how you can do so can be found in
[CONTRIBUTING.md](https://github.com/neocotic/convert-svg/blob/main/CONTRIBUTING.md). We want your suggestions and
pull requests!

A list of all contributors can be found in [AUTHORS.md](https://github.com/neocotic/convert-svg/blob/main/AUTHORS.md).

## License

Copyright © 2022 neocotic

See [LICENSE.md](https://github.com/neocotic/convert-svg/raw/main/LICENSE.md) for more information on our MIT license.
