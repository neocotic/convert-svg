/*
 * Copyright (C) 2025 neocotic
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

import { readFile, writeFile } from "node:fs/promises";
import {
  basename,
  dirname,
  extname,
  join,
  resolve as resolvePath,
} from "node:path";
import { type Cheerio, load as loadHtml } from "cheerio";
import type { Element } from "domhandler";
import fileUrl from "file-url";
import {
  type Browser,
  type BrowserContext,
  type LaunchOptions,
  type Page,
  type WaitForOptions,
  launch as launchBrowser,
} from "puppeteer-core";
import { file as tmpFile } from "tmp";
import type { IProvider } from "./provider.js";

/**
 * Converts SVG to another format using a headless Chromium instance.
 *
 * When an {@link IConverter} is created it must either be passed an existing {@link Browser} instance via
 * {@link IConverterOptions#browser} or {@link IConverterLaunchOptions} via {@link IConverterOptions#launch} so that a
 * browser instance can be created or connected; otherwise it will fail to be created.
 *
 * If an existing {@link Browser} instance is being used you may want to also consider what happens if/when the
 * {@link IConverter} is closed (e.g. via {@link #close}) as the default behavior is to close the browser and all open
 * pages, even those not opened by the {@link IConverter}. It can instead be instructed to either disconnect from the
 * browser process or do nothing at all via {@link IConverterOptions#closeBehavior}.
 *
 * Due to constraints within Chromium, the SVG input is first written to a temporary HTML file and then navigated to.
 * This is because the default page for Chromium is using the `chrome` protocol so cannot load externally referenced
 * files (e.g. that use the `file` protocol). Each invocation of {@link #convert} or {@link #convertFile} open their own
 * {@link Page} and create their own temporary files to avoid conflicts with other asynchronous invocations, which is
 * closed and deleted respectively once finished. This allows a single {@link IConverter} to safely process these calls
 * concurrently.
 *
 * An {@link IConverter} uses its own {@link BrowserContext} to open each new {@link Page}. This ensures that the pages
 * are isolated and that they can be closed by the {@link IConverter} accordingly.
 *
 * It's also the responsibility of the caller to ensure that all {@link IConverter} instances are closed before the
 * process exits.
 */
export interface IConverter<
  ConvertOptions extends IConverterConvertOptions,
  ConvertOptionsParsed extends IConverterConvertOptionsParsed,
> {
  /**
   * Whether this {@link IConverter} has been closed.
   */
  readonly closed: boolean;
  /**
   * The {@link IProvider} for this {@link IConverter}.
   */
  readonly provider: IProvider<ConvertOptions, ConvertOptionsParsed>;

  /**
   * Closes this {@link IConverter}.
   *
   * What happens when the {@link IConverter} closes depends entirely on which {@link IConverterCloseBehavior} is being
   * used. The default behaviour is `"close"` but this may have been changed via {@link IConverterOptions#closeBehavior}
   * when this {@link IConverter} was created.
   *
   * Regardless of the behavior above, any temporary files that may have been created by this {@link IConverter} that
   * have not yet been deleted will be deleted now.
   *
   * Once closed, this {@link IConverter} should be discarded and a new one created, as and when needed.
   *
   * An error will occur if any problem arises while performing the closing behavior, where applicable.
   */
  close(): Promise<void>;

  /**
   * Converts the specified `input` SVG into another format using the `options` provided.
   *
   * `input` can either be an SVG buffer or string.
   *
   * If the width and/or height cannot be derived from `input`; then they must be provided via their corresponding
   * options. This method attempts to derive the dimensions from `input` via any `width`/`height` attributes or its
   * calculated `viewBox` attribute.
   *
   * Only standard SVG element attributes (excl. event attributes) are allowed, and others are stripped from the SVG
   * before being converted. This includes deprecated attributes unless the `allowDeprecatedAttributes` option is
   * disabled. This is primarily for security purposes to ensure that malicious code cannot be injected.
   *
   * This method is resolved with the converted output buffer.
   *
   * An error will occur if this {@link IConverter} has been closed, both the `baseFile` and `baseUrl` options have been
   * provided, `input` does not contain an SVG element, or no `width` and/or `height` options were provided and this
   * information could not be derived from `input`.
   *
   * @param input The SVG input to be converted to another format.
   * @param options The options to be used.
   * @return The converted output buffer.
   */
  convert(input: Buffer | string, options?: ConvertOptions): Promise<Buffer>;

  /**
   * Converts the SVG file at the specified path into another format using the `options` provided and writes it to the
   * output file.
   *
   * The output file is derived from `inputFilePath` unless the `outputFilePath` option is specified.
   *
   * If the width and/or height cannot be derived from the input file, then they must be provided via their
   * corresponding options. This method attempts to derive the dimensions from the input file via any `width`/`height`
   * attributes or its calculated `viewBox` attribute.
   *
   * Only standard SVG element attributes (excl. event attributes) are allowed, and others are stripped from the SVG
   * before being converted. This includes deprecated attributes unless the `allowDeprecatedAttributes` option is
   * disabled. This is primarily for security purposes to ensure that malicious code cannot be injected.
   *
   * This method is resolved with the path of the converted output file for reference.
   *
   * An error will occur if this {@link IConverter} has been closed, both the `baseFile` and `baseUrl` options have been
   * provided, the input file does not contain an SVG element, no `width` and/or `height` options were provided and this
   * information could not be derived from an input file, or a problem arises while reading the input file or writing
   * the output file.
   *
   * @param inputFilePath The path of the SVG file to be converted to another file format.
   * @param options The options to be used.
   * @return The output file path.
   */
  convertFile(
    inputFilePath: string,
    options?: IConverterConvertFileOptions<ConvertOptions>,
  ): Promise<string>;
}

/**
 * The options that can be used to construct an implementation of {@link IConverter}.
 */
export interface IConverterOptions<
  ConvertOptions extends IConverterConvertOptions,
  ConvertOptionsParsed extends IConverterConvertOptionsParsed,
> {
  /**
   * An existing {@link Browser} instance provided by `puppeteer-core` that is used to create a {@link BrowserContext}
   * to open each new {@link Page} to capture a screenshot of an SVG to convert it into another format. If specified,
   * {@link #launch} will be ignored.
   *
   * For context; each {@link IConverter} instance uses their own {@link BrowserContext} to open each new {@link Page}.
   * This ensures that the pages are isolated and that they can be closed by the {@link IConverter} accordingly. A
   * {@linl Page} is opened for each invocation of {@link IConverter#convert} and {@link IConverter#convertFile} and
   * closed once finished. If the {@link IConverter} is closed (e.g. via {@link IConverter#close}), any pages currently
   * open due to ongoing invocations of those methods will be closed immediately and will likely result in them
   * rejecting.
   */
  browser?: Browser;
  /**
   * The behavior when the {@link IConverter} is closed (e.g. via {@link IConverter#close}), which may be one of the
   * following:
   *
   * - `"close"` - Calls {@link Browser#close}, effectively closing the browser and therefore all open pages, even those
   *   not opened by the {@link IConverter} in the scenario that a shared browser instance or connection is being used.
   *   This is the default behavior as it typically makes most sense for those wanting to just let the `convert-svg-*`
   *   package to manage the browser resources.
   * - `"disconnect"` - Calls {@link BrowserContext#close} and {@link Browser#disconnect}, effectively closing any pages
   *   opened by the {@link IConverter} and disconnecting from the browser, keeping the browser process running and any
   *   other pages created outside the {@link IConverter} open.
   * - `"none"` - Calls {@link BrowserContext#close}, effectively closing any pages opened by the {@link IConverter} but
   *   not doing anything with the browser. This could potentially result in a browser instance running that cannot be
   *   accessed to close depending on what was responsible for creating or connecting to the browser.
   *
   * Care should be taken when specifying this option that the consequences are fully understood as well as the shift in
   * the responsibilities to the caller to ensure that resources are managed accordingly.
   *
   * @defaultValue "close"
   */
  closeBehavior?: IConverterCloseBehavior;
  /**
   * The options that are to be passed directly to `puppeteer-core` when launching a new {@link Browser} that is used to
   * create a {@link BrowserContext} to open each new {@link Page} to capture a screenshot of an SVG to convert it into
   * another format. Ignored if {@link #browser} is also specified.
   *
   * For context; each {@link IConverter} instance uses their own {@link BrowserContext} to open each new {@link Page}.
   * This ensures that the pages are isolated and that they can be closed by the {@link IConverter} accordingly. A
   * {@linl Page} is opened for each invocation of {@link IConverter#convert} and {@link IConverter#convertFile} and
   * closed once finished. If the {@link IConverter} is closed (e.g. via {@link IConverter#close}), any pages currently
   * open due to ongoing invocations of those methods will be closed immediately and will likely result in them
   * rejecting.
   */
  launch?: IConverterLaunchOptions;
  /**
   * The options that are to be passed directly to `puppeteer-core` when populating a {@link Page} with the SVG
   * contents.
   *
   * For context; each {@link IConverter} instance uses their own {@link BrowserContext} to open each new {@link Page}.
   * This ensures that the pages are isolated and that they can be closed by the {@link IConverter} accordingly. A
   * {@linl Page} is opened for each invocation of {@link IConverter#convert} and {@link IConverter#convertFile} and
   * closed once finished. If the {@link IConverter} is closed (e.g. via {@link IConverter#close}), any pages currently
   * open due to ongoing invocations of those methods will be closed immediately and will likely result in them
   * rejecting.
   */
  page?: WaitForOptions;
  /**
   * The {@link IProvider} to be used.
   */
  provider: IProvider<ConvertOptions, ConvertOptionsParsed>;
}

/**
 * The behavior when a {@link IConverter} is closed (e.g. via {@link IConverter#close}), which may be one of the
 * following:
 *
 * - `"close"` - Calls {@link Browser#close}, effectively closing the browser and therefore all open pages, even those
 *   not opened by the {@link IConverter} in the scenario that a shared browser instance or connection is being used.
 * - `"disconnect"` - Calls {@link BrowserContext#close} and {@link Browser#disconnect}, effectively closing any pages
 *   opened by the {@link IConverter} and disconnecting from the browser, keeping the browser process running and any
 *   other pages created outside the {@link IConverter} open.
 * - `"none"` - Calls {@link BrowserContext#close}, effectively closing any pages opened by the {@link IConverter} but
 *   not doing anything with the browser. This could potentially result in a browser instance running that cannot be
 *   accessed to close depending on what was responsible for creating or connecting to the browser.
 */
export type IConverterCloseBehavior = "close" | "disconnect" | "none";

/**
 * The options that can be passed to {@link IConverter#convert}.
 */
export interface IConverterConvertOptions {
  /**
   * Whether deprecated SVG element attributes should be retained in the SVG during conversion.
   *
   * @defaultValue true
   */
  allowDeprecatedAttributes?: boolean;
  /**
   * The background color to be used to fill transparent regions within the SVG. If omitted, the {@link IProvider} will
   * determine the default background color.
   */
  background?: string;
  /**
   * The path of the file to be converted into a file URL to use for all relative URLs contained within the SVG. Cannot
   * be used in conjunction with {@link #baseUrl}.
   */
  baseFile?: string;
  /**
   * The base URL to use for all relative URLs contained within the SVG. Cannot be used in conjunction with
   * {@link #baseFile}.
   */
  baseUrl?: string;
  /**
   * The height of the output to be generated. If omitted, an attempt will be made to derive the height from the SVG
   * input.
   */
  height?: number | string;
  /**
   * The type of rounding to be applied to the width and height, which may be one of the following:
   *
   * - `"ceil"` - Values are rounded using `Math.ceil`.
   * - `"floor"` - Values are rounded using `Math.floor`.
   * - `"round"` - Values are rounded using `Math.round`. The default rounding used, if omitted.
   *
   * @defaultValue "round"
   */
  rounding?: IConverterRounding;
  /**
   * The scale to be applied to the width and height (either specified as options or derived).
   *
   * @defaultValue 1
   */
  scale?: number;
  /**
   * The width of the output to be generated. If omitted, an attempt will be made to derive the width from the SVG
   * input.
   */
  width?: number | string;
}

/**
 * The options that can be passed to {@link IConverter#convert} after being parsed.
 */
export interface IConverterConvertOptionsParsed {
  /**
   * Whether deprecated SVG element attributes should be retained in the SVG during conversion.
   */
  allowDeprecatedAttributes: boolean;
  /**
   * The background color to be used to fill transparent regions within the SVG. If omitted, the {@link IProvider} will
   * determine the default background color.
   */
  background?: string;
  /**
   * The base URL to use for all relative URLs contained within the SVG.
   */
  baseUrl: string;
  /**
   * The height of the output to be generated. If omitted, an attempt will be made to derive the height from the SVG
   * input.
   */
  height?: number;
  /**
   * The type of rounding to be applied to the width and height, which may be one of the following:
   *
   * - `"ceil"` - Values are rounded using `Math.ceil`.
   * - `"floor"` - Values are rounded using `Math.floor`.
   * - `"round"` - Values are rounded using `Math.round`.
   */
  rounding: IConverterRounding;
  /**
   * The scale to be applied to the width and height (either specified as options or derived).
   */
  scale: number;
  /**
   * The width of the output to be generated. If omitted, an attempt will be made to derive the width from the SVG
   * input.
   */
  width?: number;
}

/**
 * The options that can be passed to {@link IConverter#convertFile}.
 */
export type IConverterConvertFileOptions<
  ConvertOptions extends IConverterConvertOptions,
> = ConvertOptions & {
  /**
   * The path of the file to which the output should be written to. By default, this will be derived from the input file
   * path.
   */
  outputFilePath?: string;
};

/**
 * The options that can be passed to {@link IConverter#convertFile} after being parsed.
 */
export type IConverterConvertFileOptionsParsed<
  ConvertOptionsParsed extends IConverterConvertOptionsParsed,
> = ConvertOptionsParsed & {
  /**
   * The path of the file to which the output should be written to.
   */
  outputFilePath: string;
};

/**
 * The options that can be passed directly to `puppeteer-core` when launching a new {@link Browser} that is used to
 * create a {@link BrowserContext} to open each new {@link Page} to capture a screenshot of an SVG to convert it into
 * another format.
 */
export type IConverterLaunchOptions = Omit<LaunchOptions, "executablePath"> & {
  /**
   * The executable path of a puppeteer-compatible browser to be used or a function that returns it based on the
   * {@link LaunchOptions} provided.
   *
   * This supports passing the `executablePath` exported from `puppeteer` to be passed directly as an option without
   * first invoking it, ensuring that all other {@link LaunchOptions} are resolved beforehand (incl. any provided via
   * the `CONVERT_SVG_LAUNCH_OPTIONS` environment variable).
   *
   * @param options The resolved {@link LaunchOptions} to be used.
   * @return The browser executable path to be used.
   */
  executablePath?: string | ((options: LaunchOptions) => string);
};

/**
 * The type of rounding to be applied to the width and height during a conversion, which may be one of the following:
 *
 * - `"ceil"` - Values are rounded using `Math.ceil`.
 * - `"floor"` - Values are rounded using `Math.floor`.
 * - `"round"` - Values are rounded using `Math.round`.
 */
export type IConverterRounding = "ceil" | "floor" | "round";

/**
 * An implementation of {@link IConverter}.
 */
export class Converter<
  ConvertOptions extends IConverterConvertOptions,
  ConvertOptionsParsed extends IConverterConvertOptionsParsed,
> implements IConverter<ConvertOptions, ConvertOptionsParsed>
{
  static readonly #allowedAttributeNames = new Set<string>([
    // Core
    "height",
    "preserveAspectRatio",
    "viewBox",
    "width",
    "x",
    "xmlns",
    "y",
    // Conditional Processing
    "requiredExtensions",
    "systemLanguage",
    // Presentation
    "clip-path",
    "clip-rule",
    "color",
    "color-interpolation",
    "cursor",
    "display",
    "fill",
    "fill-opacity",
    "fill-rule",
    "filter",
    "mask",
    "opacity",
    "overflow",
    "pointer-events",
    "shape-rendering",
    "stroke",
    "stroke-dasharray",
    "stroke-dashoffset",
    "stroke-linecap",
    "stroke-linejoin",
    "stroke-miterlimit",
    "stroke-opacity",
    "stroke-width",
    "style",
    "transform",
    "vector-effect",
    "visibility",
    // XML
    "xml:lang",
    "xmlns",
    "xmlns:xlink",
  ]);
  static readonly #allowedDeprecatedAttributeNames = new Set<string>([
    // Core
    "baseProfile",
    "version",
    "zoomAndPan",
    // Conditional Processing
    "requiredFeatures",
    // Presentation
    "clip",
    "color-rendering",
    "enable-background",
    // XML
    "xml:base",
    "xml:space",
  ]);

  /**
   * Creates an instance of {@link Converter} using the `options` provided.
   *
   * A {@link BrowserContext} is created from the either {@link IConverterOptions#browser}, if specified, or a new
   * {@link Browser} instance launched using {@link IConverterOptions#launch}.
   *
   * An error will occur if neither of the above options is specified.
   *
   * @param options The options to be used.
   * @return A newly created {@link Converter} instance.
   */
  static async create<
    ConvertOptions extends IConverterConvertOptions,
    ConvertOptionsParsed extends IConverterConvertOptionsParsed,
  >(
    options: IConverterOptions<ConvertOptions, ConvertOptionsParsed>,
  ): Promise<Converter<ConvertOptions, ConvertOptionsParsed>> {
    const {
      browser: browserOption,
      launch: launchOptions,
      ...converterOptions
    } = options;
    const browser =
      browserOption ??
      (await launchBrowser(
        Converter.#handleExecutablePath({
          ...Converter.parseEnvLaunchOptions(),
          ...launchOptions,
        }),
      ));
    const browserContext = await browser.createBrowserContext();

    return new Converter<ConvertOptions, ConvertOptionsParsed>({
      browser,
      browserContext,
      ...converterOptions,
    });
  }

  /**
   * Attempts to retrieve and parse {@link IConverterLaunchOptions} from the `CONVERT_SVG_LAUNCH_OPTIONS` environment
   * variable.
   *
   * The parsed value is only very loosely validated to ensure that it represents a plain object.
   *
   * @return An {@link IConverterLaunchOptions} parsed from the environment variable or `undefined` if empty.
   * @throws {Error} If the environment variable contains an invalid value.
   */
  static parseEnvLaunchOptions(): IConverterLaunchOptions | undefined {
    const options = process.env.CONVERT_SVG_LAUNCH_OPTIONS;
    if (!options) {
      return;
    }

    let parsedOptions: unknown;
    try {
      parsedOptions = JSON.parse(options);
    } catch (err) {
      throw new Error(
        `Failed to parse "CONVERT_SVG_LAUNCH_OPTIONS" environment variable: ${options}`,
        { cause: err },
      );
    }

    if (
      typeof parsedOptions === "object" &&
      parsedOptions &&
      !Array.isArray(parsedOptions)
    ) {
      return parsedOptions as IConverterLaunchOptions;
    }

    throw new Error(
      `Failed to parse "CONVERT_SVG_LAUNCH_OPTIONS" environment variable: ${options}`,
    );
  }

  static #handleExecutablePath(
    options: IConverterLaunchOptions,
  ): LaunchOptions {
    const { executablePath, ...launchOptions } = options;

    switch (typeof executablePath) {
      case "string":
        return { ...launchOptions, executablePath };
      case "function":
        return {
          ...launchOptions,
          executablePath: executablePath(launchOptions),
        };
      default:
        return launchOptions;
    }
  }

  static #isAttributeAllowed(
    attributeName: string,
    options: IConverterConvertOptions,
  ): boolean {
    return (
      Converter.#allowedAttributeNames.has(attributeName) ||
      (!!options.allowDeprecatedAttributes &&
        Converter.#allowedDeprecatedAttributeNames.has(attributeName))
    );
  }

  static #isValidRounding(
    value: string | undefined,
  ): value is IConverterRounding {
    return (
      typeof value === "string" && ["ceil", "floor", "round"].includes(value)
    );
  }

  static #parseBaseUrlOptions(
    baseFile: string | undefined,
    baseUrl: string | undefined,
    defaultBaseUrlSupplier: () => string,
  ): string {
    if (baseFile != null && baseUrl != null) {
      throw new Error(
        "Both baseFile and baseUrl options specified. Use only one",
      );
    }

    const value = typeof baseFile === "string" ? fileUrl(baseFile) : baseUrl;
    return value || fileUrl(defaultBaseUrlSupplier());
  }

  static #parseBooleanOption(
    value: boolean | undefined,
    defaultValue: boolean,
  ): boolean {
    return typeof value === "boolean" ? value : defaultValue;
  }

  static #parseNumericOption(
    value: number | string | undefined,
  ): number | undefined;
  static #parseNumericOption(
    value: number | string | undefined,
    defaultValue: number,
  ): number;
  static #parseNumericOption(
    value: number | string | undefined,
    defaultValue?: number,
  ): number | undefined {
    if (typeof value === "string") {
      return parseInt(value, 10);
    }
    return typeof value === "number" ? value : defaultValue;
  }

  static #parseRoundingOption(
    value: string | undefined,
    defaultValue: IConverterRounding,
  ): IConverterRounding {
    if (Converter.#isValidRounding(value)) {
      return value;
    }
    return defaultValue;
  }

  static #roundDimension(
    dimension: number,
    rounding: IConverterRounding,
  ): number {
    switch (rounding) {
      case "ceil":
        return Math.ceil(dimension);
      case "floor":
        return Math.floor(dimension);
      case "round":
        return Math.round(dimension);
      default:
        throw new Error(`Unexpected IConverterRounding: "${rounding}"`);
    }
  }

  static #roundDimensions(
    dimensions: IDimensions,
    rounding: IConverterRounding,
  ): IDimensions {
    return {
      height: Converter.#roundDimension(dimensions.height, rounding),
      width: Converter.#roundDimension(dimensions.width, rounding),
    };
  }

  static async #setDimensions(
    { page }: IContext,
    dimensions: Partial<IDimensions>,
  ): Promise<void> {
    if (
      typeof dimensions.width !== "number" &&
      typeof dimensions.height !== "number"
    ) {
      return;
    }

    await page.evaluate(({ width, height }) => {
      const el = document.querySelector("svg");
      if (!el) {
        return;
      }

      if (typeof width === "number") {
        el.setAttribute("width", `${width}px`);
      } else {
        el.removeAttribute("width");
      }

      if (typeof height === "number") {
        el.setAttribute("height", `${height}px`);
      } else {
        el.removeAttribute("height");
      }
    }, dimensions);
  }

  readonly #browser: Browser;
  readonly #browserContext: BrowserContext;
  readonly #closeBehavior: IConverterCloseBehavior;
  #closed: boolean;
  readonly #pageOptions: WaitForOptions;
  readonly #provider: IProvider<ConvertOptions, ConvertOptionsParsed>;
  #tempFiles: Record<string, ITempFile> = {};

  private constructor(
    options: ConverterOptions<ConvertOptions, ConvertOptionsParsed>,
  ) {
    this.#browser = options.browser;
    this.#browserContext = options.browserContext;
    this.#closed = !options.browser.connected;
    this.#closeBehavior = options.closeBehavior || "close";
    this.#pageOptions = { ...options.page };
    this.#provider = options.provider;
  }

  async convert(
    input: Buffer | string,
    options?: ConvertOptions,
  ): Promise<Buffer> {
    this.#validate();

    const parsedOptions = this.#parseConvertOptions(options, process.cwd);

    return await this.#convert(input, parsedOptions);
  }

  async convertFile(
    inputFilePath: string,
    options?: IConverterConvertFileOptions<ConvertOptions>,
  ): Promise<string> {
    this.#validate();

    const parsedOptions = this.#parseConvertFileOptions(inputFilePath, options);

    const input = await readFile(inputFilePath);
    const output = await this.#convert(input, parsedOptions);

    await writeFile(parsedOptions.outputFilePath, output);

    return parsedOptions.outputFilePath;
  }

  async close(): Promise<void> {
    if (this.#closed) {
      return;
    }

    this.#closed = true;

    switch (this.#closeBehavior) {
      case "close":
        await this.#browser.close();
        break;
      case "disconnect":
        await this.#browserContext.close();
        await this.#browser.disconnect();
        break;
      case "none":
        await this.#browserContext.close();
        break;
      default:
        throw new Error(
          `Unexpected IConverterCloseBehavior: "${this.#closeBehavior}"`,
        );
    }

    Object.values(this.#tempFiles).forEach((tempFile) => tempFile.cleanup());
    this.#tempFiles = {};
  }

  async #closeContext(context: IContext): Promise<void> {
    context.tempFile.cleanup();
    delete this.#tempFiles[context.tempFile.path];

    await context.page.close();
  }

  async #convert(
    input: Buffer | string,
    options: ConvertOptionsParsed,
  ): Promise<Buffer> {
    input = Buffer.isBuffer(input) ? input.toString("utf8") : input;

    const provider = this.#provider;
    const $ = loadHtml(input, null, false);
    const $svg = $("svg:first");

    this.#sanitize($svg, options);
    $svg.find("svg").each((_i, svg) => {
      this.#sanitize($(svg), options);
    });

    const svg = $svg.prop("outerHTML") as unknown as string;
    if (!svg) {
      throw new Error("SVG element not found in input. Check the SVG input");
    }

    const html = `<!DOCTYPE html>
<html>
<head>
<base href="${options.baseUrl}">
<meta charset="utf-8">
<style>
* { margin: 0; padding: 0; }
html { background-color: ${provider.getBackgroundColor(options)}; }
</style>
</head>
<body>${svg}</body>
</html>`;

    const context = await this.#createContext(html);

    try {
      await Converter.#setDimensions(context, options);

      let dimensions = await this.#getDimensions(context, options);

      if (options.scale !== 1) {
        dimensions = Converter.#roundDimensions(
          {
            height: dimensions.height * options.scale,
            width: dimensions.width * options.scale,
          },
          options.rounding,
        );

        await Converter.#setDimensions(context, dimensions);
      }

      await context.page.setViewport(dimensions);

      return Buffer.from(
        await context.page.screenshot({
          clip: { x: 0, y: 0, ...dimensions },
          ...provider.getScreenshotOptions(options),
          type: provider.format,
        }),
      );
    } finally {
      await this.#closeContext(context);
    }
  }

  async #createContext(html: string): Promise<IContext> {
    const [page, tempFile] = await Promise.all([
      this.#browserContext.newPage(),
      this.#createTempFile(),
    ]);

    await writeFile(tempFile.path, html);
    await page.goto(fileUrl(tempFile.path), this.#pageOptions);

    return { page, tempFile };
  }

  #createTempFile(): Promise<ITempFile> {
    return new Promise((resolve, reject) =>
      tmpFile(
        { prefix: "convert-svg-", postfix: ".html" },
        (error, filePath, _fd, cleanup) => {
          if (error) {
            reject(error);
          } else {
            const tempFile = { path: filePath, cleanup };
            this.#tempFiles[filePath] = tempFile;

            resolve(tempFile);
          }
        },
      ),
    );
  }

  async #getDimensions(
    { page }: IContext,
    options: ConvertOptionsParsed,
  ): Promise<IDimensions> {
    const dimensions = await page.evaluate(() => {
      const el = document.querySelector("svg");
      if (!el) {
        return null;
      }

      const parseAttributeDimension = (
        attributeName: string,
      ): number | null => {
        const attributeValue = el.getAttribute(attributeName);
        if (!attributeValue || attributeValue.endsWith("%")) {
          return null;
        }

        const dimension = parseFloat(attributeValue);
        if (Number.isNaN(dimension)) {
          return null;
        }

        if (attributeValue.endsWith("pt")) {
          return dimension * 1.33333;
        }

        return dimension;
      };

      const width = parseAttributeDimension("width");
      const height = parseAttributeDimension("height");

      if (width && height) {
        return { width, height };
      }

      const viewBoxWidth = el.viewBox.animVal.width;
      const viewBoxHeight = el.viewBox.animVal.height;

      if (width && viewBoxHeight) {
        return {
          width,
          height: (width * viewBoxHeight) / viewBoxWidth,
        };
      }

      if (height && viewBoxWidth) {
        return {
          width: (height * viewBoxWidth) / viewBoxHeight,
          height,
        };
      }

      return null;
    });
    if (!dimensions) {
      throw new Error(
        "Unable to derive width and height from SVG. Consider specifying corresponding options",
      );
    }

    return Converter.#roundDimensions(dimensions, options.rounding);
  }

  #parseConvertFileOptions(
    inputFilePath: string,
    options: IConverterConvertFileOptions<ConvertOptions> | undefined,
  ): IConverterConvertFileOptionsParsed<ConvertOptionsParsed> {
    const parsedOptions = this.#parseConvertOptions(options, () =>
      inputFilePath ? resolvePath(inputFilePath) : process.cwd(),
    );

    let outputFilePath = options?.outputFilePath;
    if (!outputFilePath) {
      const extension = `.${this.#provider.extension}`;
      const outputDirPath = dirname(inputFilePath);
      const outputFileName = `${basename(inputFilePath, extname(inputFilePath))}${extension}`;

      outputFilePath = join(outputDirPath, outputFileName);
    }

    return {
      ...parsedOptions,
      outputFilePath,
    };
  }

  #parseConvertOptions(
    options: ConvertOptions | undefined,
    defaultBaseUrlSupplier: () => string,
  ): ConvertOptionsParsed {
    return this.#provider.parseConverterOptions(options, {
      allowDeprecatedAttributes: Converter.#parseBooleanOption(
        options?.allowDeprecatedAttributes,
        true,
      ),
      background: options?.background,
      baseUrl: Converter.#parseBaseUrlOptions(
        options?.baseFile,
        options?.baseUrl,
        defaultBaseUrlSupplier,
      ),
      height: Converter.#parseNumericOption(options?.height),
      rounding: Converter.#parseRoundingOption(options?.rounding, "round"),
      scale: Converter.#parseNumericOption(options?.scale, 1),
      width: Converter.#parseNumericOption(options?.width),
    });
  }

  #sanitize($svg: Cheerio<Element>, options: ConvertOptionsParsed): void {
    const attributeNames = Object.keys($svg.attr() || {});

    for (const attributeName of attributeNames) {
      if (!Converter.#isAttributeAllowed(attributeName, options)) {
        $svg.removeAttr(attributeName);
      }
    }
  }

  #validate(): void {
    if (this.#closed) {
      throw new Error(
        "Converter has been closed. A new Converter must be created",
      );
    }
    if (!this.#browser.connected) {
      throw new Error(
        "Converter has lost connection to the browser. A new Converter must be created",
      );
    }
  }

  get closed(): boolean {
    return this.#closed;
  }

  get provider(): IProvider<ConvertOptions, ConvertOptionsParsed> {
    return this.#provider;
  }
}

type ConverterOptions<
  ConvertOptions extends IConverterConvertOptions,
  ConvertOptionsParsed extends IConverterConvertOptionsParsed,
> = Omit<
  IConverterOptions<ConvertOptions, ConvertOptionsParsed>,
  "browser" | "launch"
> & {
  browser: Browser;
  browserContext: BrowserContext;
  provider: IProvider<ConvertOptions, ConvertOptionsParsed>;
};

interface IContext {
  page: Page;
  tempFile: ITempFile;
}

interface IDimensions {
  height: number;
  width: number;
}

interface ITempFile {
  path: string;

  cleanup(): void;
}
