## Version 0.7.0, 2025.06.14

* **Breaking Change:** All packages now require Node.js v22 or newer
* **Breaking Change:** Change `createConverter` to be async
* **Breaking Change:** Rename `Converter#destroy` to `Converter#close`
* **Breaking Change:** Rename `puppeteer` option to `launch`
* **Breaking Change:** Change all `convert-svg-to-<FORMAT>` packages to only depend on `puppeteer-core` so consumers
  **must** depend on `puppeteer` and pass either a `Browser` instance via the `browser` option or `LaunchOptions` via
  the `launch` option to `convert`, `convertFile`, and `createConverter` functions
* **Breaking Change:** Remove CLI support from all `convert-svg-to-<FORMAT>` packages and create new
  `convert-svg-to-<FORMAT>-cli` packages for that purpose (which come with `puppeteer` dependency to ensure browser is
  downloaded and installed for ease-of-use)
* Rewrite the entire codebase in TypeScript and support both ESM and CJS usage
* Add `browser` option to `convert`, `convertFile`, and `createConverter` functions to accept optional `Browser`
  instance
* Add `closeBehavior` option to `convert`, `convertFile`, and `createConverter` functions to control the behavior when
  `Converter#close` is called
* Add `page` option to `convert`, `convertFile`, and `createConverter` functions to accept optional options to be passed
  to `puppeteer-core` when creating a page
* Add support for `CONVERT_SVG_LAUNCH_OPTIONS` environment variable to be merged with `launch` option
* Change `Converter` to create and use `BrowserContext` per instance to use when opening new pages to ensure they are
  isolated and that they can be closed by the `Converter` accordingly
* Change `Converter#convert` and `Converter#convertFile` to create a new temporary file and open a new `Page` per
  invocation to support safe concurrent invocations of these methods on the same `Converter` instance
* Sanitize attributes on deeply nested SVG elements
* Apply the `round` option to SVG width and height when applying the `scale` option
* Improve documentation
* Improve the developer experience for contributors with better tooling
* Deprecate `convert-svg-test-helper` and create new `convert-svg-core-test` package as a replacement
* Create new `convert-svg-core-cli` package to support CLI packages
* Many internal changes to `convert-svg-core`
* Bump all dependencies to latest versions

## Version 0.6.4, 2022.06.07

* Convert only first SVG element from input [#86](https://github.com/neocotic/convert-svg/issues/86) [2bbc498](https://github.com/neocotic/convert-svg/commit/2bbc498c5029238637206661dbac9e44d37d17c5)

## Version 0.6.3, 2022.06.06

* Retain only allowed attributes from SVG input [#84](https://github.com/neocotic/convert-svg/issues/84) [a43dffa](https://github.com/neocotic/convert-svg/commit/a43dffaab0f1e419d5be84e2e7356b86ffac3cf1)

## Version 0.6.2, 2022.05.29

* Add convert-svg-to-webp package [812ea66](https://github.com/neocotic/convert-svg/commit/812ea6673b0a478c47f877d2be7afdc412669690)
* Strip onload attribute from SVG input [#81](https://github.com/neocotic/convert-svg/issues/81) [7e6031a](https://github.com/neocotic/convert-svg/commit/7e6031ac7427cf82cf312cb4a25040f2e6efe7a5)

## Version 0.6.1, 2022.04.29

* Bump cheerio dependency to latest v1 RC avoid vulnerable dependency

## Version 0.6.0, 2022.04.28

* **Breaking Change:** All packages now require Node.js version 12.20.0 or newer
* Support UTF-8 characters in SVG
* Support SVG dimensions (width, height) that use `pt` units
* Add `rounding` API and CLI option to control how dimensions are rounded (defaults to `"round"`)
* Fix [CVE-2021-23631](https://nvd.nist.gov/vuln/detail/CVE-2021-23631) by improving input validation
* `quality` CLI option for JPEG not passed correctly [#65](https://github.com/neocotic/convert-svg/issues/65)
* Bump dependencies (incl. major for Puppeteer)
* Bump devDependencies
* Skip inconsistent tests

## Version 0.5.0, 2018.11.23

* moved from !ninja to neocotic [ad5aa55](https://github.com/neocotic/convert-svg/commit/ad5aa559daa04a4276fc025e0a37d0d9768eab28)
* modified CI to now target Node.js 8, 10, and 11 [63fcb27](https://github.com/neocotic/convert-svg/commit/63fcb2702cba03ec12f7998c0c0ee0b84b862986)
* bump dependencies [6daedb1](https://github.com/neocotic/convert-svg/commit/6daedb1d27f56455d7797628bbff90aa59597565)
* bumped devDependenices [3a8ae85](https://github.com/neocotic/convert-svg/commit/3a8ae8528939819a90f2754adacc82864475d967)
* fixed linting errors [96e7e06](https://github.com/neocotic/convert-svg/commit/96e7e061abb75b83b92ca675f2d1bb68e76f28ae)
* fixed broken tests by regenerating expected fixtures [bf34770](https://github.com/neocotic/convert-svg/commit/bf34770a5707903849cd8005a7b82d735ee3c281)
* preventing lerna breaking build when calling "npm ci" on bootstrap [1391071](https://github.com/neocotic/convert-svg/commit/1391071f57550d2b9b9ded5dca84776d3ce11fa7)
* skipped tests that were causing CI build to fail intermittently [cdf43c0](https://github.com/neocotic/convert-svg/commit/cdf43c06079e498354c4e8299f784dc290a11461)

## Version 0.4.0, 2018.02.05

* Bump Puppeteer to v1 [#32](https://github.com/neocotic/convert-svg/issues/32)
* Replace chai with assert [#34](https://github.com/neocotic/convert-svg/issues/34)

## Version 0.3.3, 2017.12.08

* Add puppeteer.launch options available into CLI [#29](https://github.com/neocotic/convert-svg/issues/29)

## Version 0.3.2, 2017.11.21

* Error being thrown caused by lost context for CLI [#24](https://github.com/neocotic/convert-svg/issues/24)
* Pass custom arguments to puppeteer [#25](https://github.com/neocotic/convert-svg/issues/25) [#27](https://github.com/neocotic/convert-svg/issues/27)
* Bump puppeteer to v0.13.0 [#26](https://github.com/neocotic/convert-svg/issues/26)

## Version 0.3.1, 2017.11.03

* Error thrown as context is lost for API methods when using destructuring imports [#22](https://github.com/neocotic/convert-svg/issues/22)

## Version 0.3.0, 2017.11.03

* Add option to control background color [#14](https://github.com/neocotic/convert-svg/issues/14)
* Remove all controllable short options for CLI [#15](https://github.com/neocotic/convert-svg/issues/15) (**breaking change**)
* Split package up into multiple packages to be more modular [#17](https://github.com/neocotic/convert-svg/issues/17) (**breaking change**)
* Add convert-svg-to-jpeg package to convert SVG to JPEG [#18](https://github.com/neocotic/convert-svg/issues/18)

## Version 0.2.0, 2017.10.29

* Add CLI & convertFile method to API [#2](https://github.com/neocotic/convert-svg/issues/2) [#8](https://github.com/neocotic/convert-svg/issues/8)
* Add scale option [#3](https://github.com/neocotic/convert-svg/issues/3) [#11](https://github.com/neocotic/convert-svg/issues/11)
* Throw error when baseFile & baseUrl options are both specified [#4](https://github.com/neocotic/convert-svg/issues/4) (**breaking change**)
* Change source/target terminology to input/output [#6](https://github.com/neocotic/convert-svg/issues/6)
* Expose Converter class as primary export [#9](https://github.com/neocotic/convert-svg/issues/9) (**breaking change**)

## Version 0.1.0, 2017.10.19

* Initial release
