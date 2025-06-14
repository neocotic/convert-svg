# convert-svg

[![Build Status](https://img.shields.io/github/actions/workflow/status/neocotic/convert-svg/ci.yml?event=push&style=for-the-badge)](https://github.com/neocotic/convert-svg/actions/workflows/ci.yml)
[![Release](https://img.shields.io/github/v/release/neocotic/convert-svg?style=for-the-badge)](https://github.com/neocotic/convert-svg)
[![License](https://img.shields.io/github/license/neocotic/convert-svg?style=for-the-badge)](https://github.com/neocotic/convert-svg/blob/main/LICENSE.md)

This monorepo contains the following [Node.js](https://nodejs.org) packages that can convert an SVG into another format
using headless Chromium.

These are primarily split up into core packages that support the format-specific packages:

* __Core__
  * [convert-svg-core](https://github.com/neocotic/convert-svg/tree/main/packages/convert-svg-core)
  * [convert-svg-core-cli](https://github.com/neocotic/convert-svg/tree/main/packages/convert-svg-core-cli)
  * [convert-svg-core-test](https://github.com/neocotic/convert-svg/tree/main/packages/convert-svg-core-test)
* __JPEG__
  * [convert-svg-to-jpeg](https://github.com/neocotic/convert-svg/tree/main/packages/convert-svg-to-jpeg)
  * [convert-svg-to-jpeg-cli](https://github.com/neocotic/convert-svg/tree/main/packages/convert-svg-to-jpeg-cli)
* __PNG__
  * [convert-svg-to-png](https://github.com/neocotic/convert-svg/tree/main/packages/convert-svg-to-png)
  * [convert-svg-to-png-cli](https://github.com/neocotic/convert-svg/tree/main/packages/convert-svg-to-png-cli)
* __WEBP__
  * [convert-svg-to-webp](https://github.com/neocotic/convert-svg/tree/main/packages/convert-svg-to-webp)
  * [convert-svg-to-webp-cli](https://github.com/neocotic/convert-svg/tree/main/packages/convert-svg-to-webp-cli)

As you can perhaps tell, the format-specific packages follow the below naming convention: 

    convert-svg-to-<FORMAT>
    convert-svg-to-<FORMAT>-cli

Where the first package is intended to be used as a standard library and imported into your own code and the second is
intended to be installed and used as a tool via the CLI.

It works by using headless Chromium to take a screenshot of the SVG and outputs the buffer. This does mean that the
supported output formats are limited to those supported by that the API for headless Chromium, however, as more formats
are added, additional packages can easily be created. The CLI packages are installed with `puppeteer` which downloads
and installs a headless Chromium instance, however, the others only use `puppeteer-core` which means that a Chromium
instance must be provided and connected by the dependant (e.g. using `puppeteer` or an executable path).

The core packages are not intended for use outside this monorepo and only serve to aid development and maintenance of
the other packages.

Explore the above packages to learn more on how to install and use each one.

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
