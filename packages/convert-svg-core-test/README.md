# convert-svg-core-test

[![Build Status](https://img.shields.io/github/actions/workflow/status/neocotic/convert-svg/ci.yml?event=push&style=for-the-badge)](https://github.com/neocotic/convert-svg/actions/workflows/ci.yml)
[![Downloads](https://img.shields.io/npm/dw/convert-svg-core-test?style=for-the-badge)](https://github.com/neocotic/convert-svg/tree/main/packages/convert-svg-core-test)
[![Release](https://img.shields.io/npm/v/convert-svg-core-test?style=for-the-badge)](https://github.com/neocotic/convert-svg/tree/main/packages/convert-svg-core-test)
[![License](https://img.shields.io/github/license/neocotic/convert-svg?style=for-the-badge)](https://github.com/neocotic/convert-svg/blob/main/LICENSE.md)

A [Node.js](https://nodejs.org) package for testing SVG converters implementing using
[convert-svg-core](https://github.com/neocotic/convert-svg/tree/main/packages/convert-svg-core). This package is not
intended for general use and, instead, provides core support for testing SVG converters.

## Install

Install using [npm](https://npmjs.com):

``` sh
npm install --save-dev convert-svg-core-test
```

You'll need to have at least [Node.js](https://nodejs.org) v22 or newer.

If you're looking to create a converter for a new format, we'd urge you to consider contributing to this framework so
that it can be easily integrated and maintained. Read the [Contributors](#contributors) section for information on how
you can contribute.

## Usage

Take a look at the tests for existing SVG converters under the
[packages](https://github.com/neocotic/convert-svg/tree/main/packages) directory for examples on how to use this
package.

## Testing

Testing your SVG converter actually works is just as important as implementing it. Since `convert-svg-core` contains a
lot of the conversion logic, a
[convert-svg-core-test](https://github.com/neocotic/convert-svg/tree/main/packages/convert-svg-core-test) package is
available to make testing implementations even easier. Again, take a look at the tests for existing SVG converters under
the [packages](https://github.com/neocotic/convert-svg/tree/main/packages) directory for examples.

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
