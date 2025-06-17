# convert-svg-to-jpeg-cli

[![Build Status](https://img.shields.io/github/actions/workflow/status/neocotic/convert-svg/ci.yml?event=push&style=for-the-badge)](https://github.com/neocotic/convert-svg/actions/workflows/ci.yml)
[![Downloads](https://img.shields.io/npm/dw/convert-svg-to-jpeg-cli?style=for-the-badge)](https://github.com/neocotic/convert-svg/tree/main/packages/convert-svg-to-jpeg-cli)
[![Release](https://img.shields.io/npm/v/convert-svg-to-jpeg-cli?style=for-the-badge)](https://github.com/neocotic/convert-svg/tree/main/packages/convert-svg-to-jpeg-cli)
[![License](https://img.shields.io/github/license/neocotic/convert-svg?style=for-the-badge)](https://github.com/neocotic/convert-svg/blob/main/LICENSE.md)

A [Node.js](https://nodejs.org) package for converting SVG to JPEG using headless Chromium via CLI.

If you want to convert SVG to JPEG programmatically, you should instead look at
[convert-svg-to-jpeg](https://github.com/neocotic/convert-svg/tree/main/packages/convert-svg-to-jpeg).

## Install

Install using [npm](https://npmjs.com) to access the `convert-svg-to-jpeg` command from anywhere:

``` sh
npm install --global convert-svg-to-jpeg-cli
```

You'll need to have at least [Node.js](https://nodejs.org) v22 or newer.

This package uses [Puppeteer](https://pptr.dev) under-the-hood to interface with a headless Chromium instance and will
download and install a headless Chromium instance for you.

## Usage

    Usage: convert-svg-to-jpeg [options] [files...]


      Options:

        -V, --version          output the version number
        --no-color             disables color output
        --background <color>   specify background color for transparent regions in SVG
        --base-url <url>       specify base URL to use for all relative URLs in SVG
        --filename <filename>  specify filename for the JPEG output when processing STDIN
        --height <value>       specify height for JPEG
        --launch <json>        specify a json object passed to puppeteer when launching a browser
        --page <json>          specify a json object passed to puppeteer opening a page
        --rounding <type>      specify type of rounding to apply to dimensions
        --scale <value>        specify scale to apply to dimensions [1]
        --width <value>        specify width for JPEG
        --quality <value>      specify quality for JPEG [100]
        -h, --help             output usage information

The CLI can be used in the following ways:

* Pass SVG files to be converted to JPEG files as command arguments
    * A [glob](https://npmjs.com/package/glob) pattern can be passed
    * Each converted SVG file will result in a corresponding JPEG with the same base file name (e.g.
      `image.svg -> image.jpeg`)
* Pipe SVG buffer to be converted to JPEG to command via STDIN
    * If the `--filename` option is passed, the JPEG will be written to a file resolved using its value
    * Otherwise, the JPEG will be streamed to STDOUT

## Environment

This package supports the use of a `CONVERT_SVG_LAUNCH_OPTIONS` environment variable to act as a base for the `--launch`
option. This can make it easier to control the browser launch/connection. For example;

``` sh
export CONVERT_SVG_LAUNCH_OPTIONS='{"browser": "firefox", "executablePath": "/Applications/Firefox.app/Contents/MacOS/firefox"}'
```

## macOS

> ⚠️ **Heads up!**
>
> If you are using this package on macOS it's important to note that there is a noticeable reduction in the quality of
> output files compared to other operating systems. This appears to be caused by SVG rendering within Chromium on macOS
> itself.
>
> As such, there are a few options available:
>
> 1. Connect this package to a Firefox instance; however, some features may not be supported due to their lack of
     > support in [WebDriver BiDi](https://w3c.github.io/webdriver-bidi/).
> 2. Run this package on Linux (e.g. Ubuntu), even if it's just within Docker, will have noticeable improvements of
     > macOS rendering.
> 3. If possible, increase the size of the input SVG as this can sometimes result in a better output.

## Other Formats

If you would like to convert an SVG into a format other than JPEG, check out our other converter packages below:

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
