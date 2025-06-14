# convert-svg-to-webp-cli

[![Build Status](https://img.shields.io/github/actions/workflow/status/neocotic/convert-svg/ci.yml?event=push&style=for-the-badge)](https://github.com/neocotic/convert-svg/actions/workflows/ci.yml)
[![Downloads](https://img.shields.io/npm/dw/convert-svg-to-webp-cli?style=for-the-badge)](https://github.com/neocotic/convert-svg/tree/main/packages/convert-svg-to-webp-cli)
[![Release](https://img.shields.io/npm/v/convert-svg-to-webp-cli?style=for-the-badge)](https://github.com/neocotic/convert-svg/tree/main/packages/convert-svg-to-webp-cli)
[![License](https://img.shields.io/github/license/neocotic/convert-svg?style=for-the-badge)](https://github.com/neocotic/convert-svg/blob/main/LICENSE.md)

A [Node.js](https://nodejs.org) package for converting SVG to WEBP using headless Chromium via CLI.

If you want to convert SVG to WEBP programmatically, you should instead look at
[convert-svg-to-webp](https://github.com/neocotic/convert-svg/tree/main/packages/convert-svg-to-webp).

## Install

Install using [npm](https://npmjs.com) to access the `convert-svg-to-webp` command from anywhere:

``` sh
npm install --global convert-svg-to-webp-cli
```

You'll need to have at least [Node.js](https://nodejs.org) v22 or newer.

This package uses [Puppeteer](https://pptr.dev) under-the-hood to interface with a headless Chromium instance and will
download and install a headless Chromium instance for you.

## Usage

    Usage: convert-svg-to-webp [options] [files...]


      Options:

        -V, --version          output the version number
        --no-color             disables color output
        --background <color>   specify background color for transparent regions in SVG
        --base-url <url>       specify base URL to use for all relative URLs in SVG
        --filename <filename>  specify filename for the WEBP output when processing STDIN
        --height <value>       specify height for WEBP
        --launch <json>        specify a json object passed to puppeteer when launching a browser
        --page <json>          specify a json object passed to puppeteer opening a page
        --rounding <type>      specify type of rounding to apply to dimensions
        --scale <value>        specify scale to apply to dimensions [1]
        --width <value>        specify width for WEBP
        --quality <value>      specify quality for WEBP [100]
        -h, --help             output usage information

The CLI can be used in the following ways:

* Pass SVG files to be converted to WEBP files as command arguments
    * A [glob](https://npmjs.com/package/glob) pattern can be passed
    * Each converted SVG file will result in a corresponding WEBP with the same base file name (e.g.
      `image.svg -> image.webp`)
* Pipe SVG buffer to be converted to WEBP to command via STDIN
    * If the `--filename` option is passed, the WEBP will be written to a file resolved using its value
    * Otherwise, the WEBP will be streamed to STDOUT

## Other Formats

If you would like to convert an SVG into a format other than WEBP, check out our other converter packages below:

https://github.com/neocotic/convert-svg

## Bugs

If you have any problems with this package or would like to see changes currently in development, you can do so
[here](https://github.com/neocotic/convert-svg/issues).

## Contributors

If you want to contribute, you're a legend! Information on how you can do so can be found in
[CONTRIBUTING.md](https://github.com/neocotic/convert-svg/blob/main/CONTRIBUTING.md). We want your suggestions and pull
requests!

A list of all contributors can be found in [AUTHORS.md](https://github.com/neocotic/convert-svg/blob/main/AUTHORS.md).

## License

Copyright © 2025 neocotic

See [LICENSE.md](https://github.com/neocotic/convert-svg/raw/main/LICENSE.md) for more information on our MIT license.
