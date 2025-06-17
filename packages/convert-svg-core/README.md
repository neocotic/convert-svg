# convert-svg-core

[![Build Status](https://img.shields.io/github/actions/workflow/status/neocotic/convert-svg/ci.yml?event=push&style=for-the-badge)](https://github.com/neocotic/convert-svg/actions/workflows/ci.yml)
[![Downloads](https://img.shields.io/npm/dw/convert-svg-core?style=for-the-badge)](https://github.com/neocotic/convert-svg/tree/main/packages/convert-svg-core)
[![Release](https://img.shields.io/npm/v/convert-svg-core?style=for-the-badge)](https://github.com/neocotic/convert-svg/tree/main/packages/convert-svg-core)
[![License](https://img.shields.io/github/license/neocotic/convert-svg?style=for-the-badge)](https://github.com/neocotic/convert-svg/blob/main/LICENSE.md)

The core [Node.js](https://nodejs.org) package for converting SVG into other formats using headless Chromium that
contains the shared logic for all converters to support programmatic use. This package is not intended to be used
directly to convert SVGs and, instead, provides core support for SVG conversion.

## Install

If you are looking to install an out-of-the-box SVG converter, check out our converter packages below:

https://github.com/neocotic/convert-svg

Alternatively, if you know what you're doing, you can install using [npm](https://npmjs.com):

``` sh
npm install --save convert-svg-core
```

You'll need to have at least [Node.js](https://nodejs.org) v22 or newer.

If you're looking to create a converter for a new format, we'd urge you to consider contributing to this framework so
that it can be easily integrated and maintained. Read the [Contributors](#contributors) section for information on how
you can contribute.

## Implementation

To create a new SVG converter that uses `convert-svg-core`, you'll need to create a new subdirectory for your package
under the [packages](https://github.com/neocotic/convert-svg/tree/main/packages) directory. Try to follow the
`convert-svg-to-<FORMAT>` naming convention for the converter package name.

Take a look at the other packages in this directory to set up the new package directory. They are all very similar, by
design, as you should just need to provide the minimal amount of information required to support your intended output
format.

Since this package only uses `puppeteer-core`, a Chromium instance must be provided and connected by the end user (e.g.
using `puppeteer` to get an executable path).

## Testing

Testing your SVG converter actually works is just as important as implementing it. Since `convert-svg-core` contains a
lot of the conversion logic, a
[convert-svg-core-test](https://github.com/neocotic/convert-svg/tree/main/packages/convert-svg-core-test) package is
available to make testing implementations even easier. Again, take a look at the tests for existing SVG converters under
the [packages](https://github.com/neocotic/convert-svg/tree/main/packages) directory for examples.

## Environment

This package supports the use of a `CONVERT_SVG_LAUNCH_OPTIONS` environment variable to act as a base for the `launch`
option passed to the `Converter` constructor. This can make it easier to control the browser launch/connection. For
example;

``` sh
export CONVERT_SVG_LAUNCH_OPTIONS='{"browser": "firefox", "executablePath": "/Applications/Firefox.app/Contents/MacOS/firefox"}'
```

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
