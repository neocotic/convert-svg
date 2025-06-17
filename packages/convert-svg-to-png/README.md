# convert-svg-to-png

[![Build Status](https://img.shields.io/github/actions/workflow/status/neocotic/convert-svg/ci.yml?event=push&style=for-the-badge)](https://github.com/neocotic/convert-svg/actions/workflows/ci.yml)
[![Downloads](https://img.shields.io/npm/dw/convert-svg-to-png?style=for-the-badge)](https://github.com/neocotic/convert-svg/tree/main/packages/convert-svg-to-png)
[![Release](https://img.shields.io/npm/v/convert-svg-to-png?style=for-the-badge)](https://github.com/neocotic/convert-svg/tree/main/packages/convert-svg-to-png)
[![License](https://img.shields.io/github/license/neocotic/convert-svg?style=for-the-badge)](https://github.com/neocotic/convert-svg/blob/main/LICENSE.md)

A [Node.js](https://nodejs.org) package for converting SVG to PNG using headless Chromium.

If you want to convert SVG to PNG via CLI, you should instead look at
[convert-svg-to-png-cli](https://github.com/neocotic/convert-svg/tree/main/packages/convert-svg-to-png-cli).

## Install

Install using [npm](https://npmjs.com):

``` sh
npm install --save convert-svg-to-png
```

You'll need to have at least [Node.js](https://nodejs.org) v22 or newer.

This package uses [Puppeteer](https://pptr.dev) under-the-hood to interface with a headless Chromium instance, however,
this package *does not** download and install a headless Chromium instance for you as of version v0.7.0. The easiest
solution is to also install `puppeteer` and connect it:

``` sh
npm install --save puppeteer
```

Continue reading for more information on how to connect `puppeteer` to `convert-svg-to-png`.

## Usage

### `convert(input, options)`

Converts the specified `input` SVG into a PNG using the `options` provided via a headless Chromium instance.

`input` can either be an SVG buffer or string.

If the width and/or height cannot be derived from `input`, then they must be provided via their corresponding options.
This method attempts to derive the dimensions from `input` via any `width`/`height` attributes or its calculated
`viewBox` attribute.

Only standard SVG element attributes (excl. event attributes) are allowed, and others are stripped from the SVG before
being converted. This includes deprecated attributes unless the `allowDeprecatedAttributes` option is disabled. This is
primarily for security purposes to ensure that malicious code cannot be injected.

This method is resolved with the PNG output buffer.

An error will occur if both the `baseFile` and `baseUrl` options have been provided, `input` does not contain an SVG
element or no `width` and/or `height` options were provided, and this information could not be derived from `input`.

A `Converter` is created and closed to perform this operation using a this `createConverter` function below. If multiple
files are being converted it is recommended to use `createConverter` to create a `Converter` and call its
`Converter#convert` method multiple times instead.

#### Options

| Option                      | Type                                    | Default                      | Description                                                                                                                                                                                                                                                           |
|-----------------------------|-----------------------------------------|------------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `allowDeprecatedAttributes` | boolean                                 | `true`                       | Whether deprecated SVG element attributes should be retained in the SVG during conversion.                                                                                                                                                                            |
| `background`                | string                                  | `"#FFF"` (White)             | Background color to be used to fill transparent regions within the SVG.                                                                                                                                                                                               |
| `baseFile`                  | string                                  | `process.cwd()`              | Path of the file to be converted into a file URL to use for all relative URLs contained within the SVG. Cannot be used in conjunction with the `baseUrl` option.                                                                                                      |
| `baseUrl`                   | string                                  | `"file:///${process.cwd()}"` | Base URL to use for all relative URLs contained within the SVG. Cannot be used in conjunction with the `baseFile` option.                                                                                                                                             |
| `browser`                   | object                                  | *None*                       | Existing `Browser` instance provided by `puppeteer` that is used to create a `BrowserContext` to open each new `Page` to capture a screenshot of an SVG to convert it into a PNG. If specified, the `launch` option will be ignored.                                  |
| `closeBehavior`             | `"close"` \| `"disconnect"` \| `"none"` | `"close"`                    | Behavior when the converter is closed.                                                                                                                                                                                                                                |
| `height`                    | number \| string                        | *Derived*                    | Height of the output to be generated. Derived from SVG input if omitted.                                                                                                                                                                                              |
| `launch`                    | object                                  | *None*                       | Options that are to be passed directly to `puppeteer` when launching a new `Browser` that is used to create a `BrowserContext` to open each new `Page` to capture a screenshot of an SVG to convert it into a PNG. Ignored if the `browser` option is also specified. |
| `page`                      | object                                  | *None*                       | Options that are to be passed directly to `puppeteer` when populating a `Page` with the SVG contents.                                                                                                                                                                 |
| `rounding`                  | `"ceil"` \| `"floor"` \| `"round"`      | `"round"`                    | Type of rounding to be applied to the width and height.                                                                                                                                                                                                               |
| `scale`                     | number                                  | `1`                          | Scale to be applied to the width and height (specified as options or derived).                                                                                                                                                                                        |
| `width`                     | number \| string                        | *Derived*                    | Width of the output to be generated. Derived from SVG input if omitted.                                                                                                                                                                                               |

#### Examples

``` javascript
import { convert } from "convert-svg-to-png";
import express from "express";
import { executablePath } from "puppeteer";

const app = express();

app.post("/convert", async (req, res) => {
  const png = await convert(req.body, {
    launch: { executablePath },
  });

  res.set("Content-Type", "image/png");
  res.send(png);
});

app.listen(3000);
```

### `convertFile(inputFilePath, options)`

Converts the SVG file at the specified path into a PNG using the `options` provided and writes it to the output file.

The output file is derived from `inputFilePath` unless the `outputFilePath` option is specified.

If the width and/or height cannot be derived from the input file, then they must be provided via their corresponding
options. This method attempts to derive the dimensions from the input file via any `width`/`height` attributes or its
calculated `viewBox` attribute.

Only standard SVG element attributes (excl. event attributes) are allowed, and others are stripped from the SVG before
being converted. This includes deprecated attributes unless the `allowDeprecatedAttributes` option is disabled. This is
primarily for security purposes to ensure that malicious code cannot be injected.

This method is resolved with the path of the PNG output file for reference.

An error will occur if both the `baseFile` and `baseUrl` options have been provided, the input file does not contain an
SVG element, no `width` and/or `height` options were provided, and this information could not be derived from an input
file, or a problem arises while reading the input file or writing the output file.

A `Converter` is created and closed to perform this operation using a this `createConverter` function below. If multiple
files are being converted it is recommended to use `createConverter` to create a `Converter` and call its
`Converter#convertFile` method multiple times instead.

#### Options

| Option                      | Type                                    | Default                      | Description                                                                                                                                                                                                                                                           |
|-----------------------------|-----------------------------------------|------------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `allowDeprecatedAttributes` | boolean                                 | `true`                       | Whether deprecated SVG element attributes should be retained in the SVG during conversion.                                                                                                                                                                            |
| `background`                | string                                  | `"#FFF"` (White)             | Background color to be used to fill transparent regions within the SVG.                                                                                                                                                                                               |
| `baseFile`                  | string                                  | `process.cwd()`              | Path of the file to be converted into a file URL to use for all relative URLs contained within the SVG. Cannot be used in conjunction with the `baseUrl` option.                                                                                                      |
| `baseUrl`                   | string                                  | `"file:///${process.cwd()}"` | Base URL to use for all relative URLs contained within the SVG. Cannot be used in conjunction with the `baseFile` option.                                                                                                                                             |
| `browser`                   | object                                  | *None*                       | Existing `Browser` instance provided by `puppeteer` that is used to create a `BrowserContext` to open each new `Page` to capture a screenshot of an SVG to convert it into a PNG. If specified, the `launch` option will be ignored.                                  |
| `closeBehavior`             | `"close"` \| `"disconnect"` \| `"none"` | `"close"`                    | Behavior when the converter is closed.                                                                                                                                                                                                                                |
| `height`                    | number \| string                        | *Derived*                    | Height of the output to be generated. Derived from SVG input if omitted.                                                                                                                                                                                              |
| `outputFilePath `           | string                                  | *Derived*                    | Path of the file to which the PNG output should be written to. Derived from `inputFilePath` if omitted.                                                                                                                                                               |
| `launch`                    | object                                  | *None*                       | Options that are to be passed directly to `puppeteer` when launching a new `Browser` that is used to create a `BrowserContext` to open each new `Page` to capture a screenshot of an SVG to convert it into a PNG. Ignored if the `browser` option is also specified. |
| `page`                      | object                                  | *None*                       | Options that are to be passed directly to `puppeteer` when populating a `Page` with the SVG contents.                                                                                                                                                                 |
| `rounding`                  | `"ceil"` \| `"floor"` \| `"round"`      | `"round"`                    | Type of rounding to be applied to the width and height.                                                                                                                                                                                                               |
| `scale`                     | number                                  | `1`                          | Scale to be applied to the width and height (specified as options or derived).                                                                                                                                                                                        |
| `width`                     | number \| string                        | *Derived*                    | Width of the output to be generated. Derived from SVG input if omitted.                                                                                                                                                                                               |

#### Examples

``` javascript
import { convertFile} from "convert-svg-to-png";
import { executablePath } from "puppeteer";

const main = async () => {
  const inputFilePath = "/path/to/my-image.svg";
  const outputFilePath = await convertFile(inputFilePath, {
    launch: { executablePath },
  });

  console.log(outputFilePath);
  //=> "/path/to/my-image.png"
};

main().catch(console.error);
```

### `createConverter(options)`

Creates an instance of `Converter` using the `options` provided.

When a `Converter` is created it must either be passed an existing `Browser` instance via the `browser` option or
`LaunchOptions` via the `launch` option so that a browser instance can be created or connected; otherwise it will fail
to be created.

If an existing `Browser` instance is being used you may want to also consider what happens if/when the `Converter` is
closed (e.g. via `Converter#close`) as the default behavior is to close the browser and all open pages, even those not
opened by the `Converter`. It can instead be instructed to either disconnect from the browser process or do nothing at
all via the `closeBehavior` option.

Due to constraints within Chromium, the SVG input is first written to a temporary HTML file and then navigated to.
This is because the default page for Chromium is using the `chrome` protocol so cannot load externally referenced
files (e.g. that use the `file` protocol). Each invocation of `Converter#convert` or `Converter#convertFile` open their
own `Page` and create their own temporary files to avoid conflicts with other asynchronous invocations, which is closed
and deleted respectively once finished. This allows the returned `Converter` to safely process these calls concurrently.

A `Converter` uses its own `BrowserContext` to open each new `Page`. This ensures that the pages are isolated and that
they can be closed by the `Converter` accordingly.

When calling either the `Converter#convert` or `Converter#convertFiles` the `options` parameter is the same as described
above except that it is entirely optional and excludes the options that intersect with the options for
`createConverter` (see below).

#### Options

| Option          | Type                                    | Default   | Description                                                                                                                                                                                                                                                           |
|-----------------|-----------------------------------------|-----------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `browser`       | object                                  | *None*    | Existing `Browser` instance provided by `puppeteer` that is used to create a `BrowserContext` to open each new `Page` to capture a screenshot of an SVG to convert it into a PNG. If specified, the `launch` option will be ignored.                                  |
| `closeBehavior` | `"close"` \| `"disconnect"` \| `"none"` | `"close"` | Behavior when the converter is closed.                                                                                                                                                                                                                                |
| `launch`        | object                                  | *None*    | Options that are to be passed directly to `puppeteer` when launching a new `Browser` that is used to create a `BrowserContext` to open each new `Page` to capture a screenshot of an SVG to convert it into a PNG. Ignored if the `browser` option is also specified. |
| `page`          | object                                  | *None*    | Options that are to be passed directly to `puppeteer` when populating a `Page` with the SVG contents.                                                                                                                                                                 |

#### Examples

``` javascript
import { readdir } from "node:fs/promises";
import { createConverter } from "convert-svg-to-png";
import { executablePath } from "puppeteer";

export const convertSvgFiles = async (dirPath) => {
  const converter = await createConverter({
    launch: { executablePath },
  });

  try {
    const filePaths = await readdir(dirPath);

    for (const filePath of filePaths) {
      await converter.convertFile(filePath);
    }
  } finally {
    await converter.close();
  }
};
```

## Environment

This package supports the use of a `CONVERT_SVG_LAUNCH_OPTIONS` environment variable to act as a base for the `launch`
option passed to the `Converter` constructor. This can make it easier to control the browser launch/connection. For
example;

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

If you would like to convert an SVG into a format other than PNG, check out our other converter packages below:

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
