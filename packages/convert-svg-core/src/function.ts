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

import {
  Converter,
  type IConverter,
  type IConverterConvertFileOptions,
  type IConverterConvertOptions,
  type IConverterConvertOptionsParsed,
  type IConverterOptions,
} from "./converter.js";
import type { IProvider } from "./provider.js";

/**
 * The options that can be passed to {@link IFuncDefinitions#convert}.
 */
export type IConvertFuncOptions<
  ConvertOptions extends IConverterConvertOptions,
  ConvertOptionsParsed extends IConverterConvertOptionsParsed,
> = ICreateConverterFuncOptions<ConvertOptions, ConvertOptionsParsed> &
  ConvertOptions;

/**
 * The options that can be passed to {@link IFuncDefinitions#convertFile}.
 */
export type IConvertFileFuncOptions<
  ConvertOptions extends IConverterConvertOptions,
  ConvertOptionsParsed extends IConverterConvertOptionsParsed,
> = ICreateConverterFuncOptions<ConvertOptions, ConvertOptionsParsed> &
  IConverterConvertFileOptions<ConvertOptions>;

/**
 * The options that can be passed to {@link IFuncDefinitions#createConverter}.
 */
export type ICreateConverterFuncOptions<
  ConvertOptions extends IConverterConvertOptions,
  ConvertOptionsParsed extends IConverterConvertOptionsParsed,
> = Omit<IConverterOptions<ConvertOptions, ConvertOptionsParsed>, "provider">;

/**
 * Contains the core functions to be exported by each format-specific non-CLI package, restricted to an individual
 * {@link IProvider}.
 */
export interface IFuncDefinitions<
  ConvertOptions extends IConverterConvertOptions,
  ConvertOptionsParsed extends IConverterConvertOptionsParsed,
> {
  /**
   * Converts the specified `input` SVG into another format using the `options` provided via a headless Chromium
   * instance.
   *
   * `input` can either be an SVG buffer or string.
   *
   * If the width and/or height cannot be derived from `input`, then they must be provided via their corresponding
   * options. This method attempts to derive the dimensions from `input` via any `width`/`height` attributes or its
   * calculated `viewBox` attribute.
   *
   * Only standard SVG element attributes (excl. event attributes) are allowed, and others are stripped from the SVG
   * before being converted. This includes deprecated attributes unless the `allowDeprecatedAttributes` option is
   * disabled. This is primarily for security purposes to ensure that malicious code cannot be injected.
   *
   * This method is resolved with the converted output buffer.
   *
   * An error will occur if both the `baseFile` and `baseUrl` options have been provided, `input` does not contain an
   * SVG element or no `width` and/or `height` options were provided, and this information could not be derived from
   * `input`.
   *
   * An {@link IConverter} is created and closed to perform this operation using {@link #createConverter}. If multiple
   * files are being converted it is recommended to use {@link #createConverter} to create an {@link IConverter} and
   * call {@link IConverter#convert} multiple times instead.
   *
   * @param input The SVG input to be converted to another format.
   * @param options The options to be used.
   * @return The converted output buffer.
   */
  convert(
    input: Buffer | string,
    options: IConvertFuncOptions<ConvertOptions, ConvertOptionsParsed>,
  ): Promise<Buffer>;

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
   * An error will occur if both the `baseFile` and `baseUrl` options have been provided, the input file does not
   * contain an SVG element, no `width` and/or `height` options were provided, and this information could not be derived
   * from an input file, or a problem arises while reading the input file or writing the output file.
   *
   * An {@link IConverter} is created and closed to perform this operation using a {@link #createConverter}. If multiple
   * files are being converted it is recommended to use {@link #createConverter} to create an {@link IConverter} and
   * call {@link IConverter#convertFile} multiple times instead.
   *
   * @param inputFilePath The path of the SVG file to be converted to another file format.
   * @param options The options to be used.
   * @return The output file path.
   */
  convertFile(
    inputFilePath: string,
    options: IConvertFileFuncOptions<ConvertOptions, ConvertOptionsParsed>,
  ): Promise<string>;

  /**
   * Creates an instance of {@link IConverter} using the `options` provided.
   *
   * When an {@link IConverter} is created it must either be passed an existing
   * {@link import('puppeteer-core').Browser Browser} instance via {@link ICreateConverterFuncOptions#browser} or
   * {@link import('puppeteer-core').LaunchOptions LaunchOptions} via {@link ICreateConverterFuncOptions#launch}
   * so that a browser instance can be created or connected; otherwise it will fail to be created.
   *
   * If an existing {@link import('puppeteer-core').Browser Browser} instance is being used you may want to also
   * consider what happens if/when the {@link IConverter} is closed (e.g. via {@link IConverter#close}) as the default
   * behavior is to close the browser and all open pages, even those not opened by the {@link IConverter}. It can
   * instead be instructed to either disconnect from the browser process or do nothing at all via
   * {@link ICreateConverterFuncOptions#closeBehavior}.
   *
   * Due to constraints within Chromium, the SVG input is first written to a temporary HTML file and then navigated to.
   * This is because the default page for Chromium is using the `chrome` protocol so cannot load externally referenced
   * files (e.g. that use the `file` protocol). Each invocation of {@link IConverter#convert} or
   * {@link IConverter#convertFile} open their own {@link import('puppeteer-core').Page Page} and create their own
   * temporary files to avoid conflicts with other asynchronous invocations, which is closed and deleted respectively
   * once finished. This allows the returned {@link IConverter} to safely process these calls concurrently.
   *
   * An {@link IConverter} uses its own {@link import('puppeteer-core').BrowserContext BrowserContext} to open each new
   * {@link import('puppeteer-core').Page Page}. This ensures that the pages are isolated and that they can be closed by
   * the {@link IConverter} accordingly.
   *
   * @param options The options to be used.
   * @return A newly created {@link IConverter} instance.
   */
  createConverter(
    options: ICreateConverterFuncOptions<ConvertOptions, ConvertOptionsParsed>,
  ): Promise<IConverter<ConvertOptions, ConvertOptionsParsed>>;
}

/**
 * Returns the core functions to be exported by each format-specific non-CLI package for the specified `provider`.
 *
 * @param provider The {@link IProvider} to be used by the returned functions.
 * @return The core functions.
 */
export const defineFunctions = <
  ConvertOptions extends IConverterConvertOptions,
  ConvertOptionsParsed extends IConverterConvertOptionsParsed,
>(
  provider: IProvider<ConvertOptions, ConvertOptionsParsed>,
): IFuncDefinitions<ConvertOptions, ConvertOptionsParsed> => ({
  async convert(
    input: Buffer | string,
    options: IConvertFuncOptions<
      ConvertOptions,
      ConvertOptionsParsed
    > = {} as IConvertFuncOptions<ConvertOptions, ConvertOptionsParsed>,
  ): Promise<Buffer> {
    const converter = await Converter.create({ ...options, provider });

    try {
      return await converter.convert(input, options);
    } finally {
      await converter.close();
    }
  },
  async convertFile(
    inputFilePath: string,
    options: IConvertFileFuncOptions<
      ConvertOptions,
      ConvertOptionsParsed
    > = {} as IConvertFileFuncOptions<ConvertOptions, ConvertOptionsParsed>,
  ): Promise<string> {
    const converter = await Converter.create({ ...options, provider });

    try {
      return await converter.convertFile(inputFilePath, options);
    } finally {
      await converter.close();
    }
  },
  createConverter(
    options: ICreateConverterFuncOptions<ConvertOptions, ConvertOptionsParsed>,
  ): Promise<IConverter<ConvertOptions, ConvertOptionsParsed>> {
    return Converter.create({ ...options, provider });
  },
});
