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

import type { ImageFormat, ScreenshotOptions } from "puppeteer-core";
import type {
  IConverterConvertOptions,
  IConverterConvertOptionsParsed,
} from "./converter.js";

/**
 * Supports a single output format for SVG conversion.
 */
export interface IProvider<
  ConvertOptions extends IConverterConvertOptions,
  ConvertOptionsParsed extends IConverterConvertOptionsParsed,
> {
  /**
   * The extension to be used for converted output files.
   */
  readonly extension: string;
  /**
   * The output image format as supported by {@link Page#screenshot}.
   */
  readonly format: ImageFormat;

  /**
   * Returns the background color to be used by the HTML page containing the SVG based on the `options` provided.
   *
   * The background color will only be applied to transparent sections of the SVG, if any.
   *
   * @param options The parsed convert options.
   * @return The background color.
   */
  getBackgroundColor(options: ConvertOptionsParsed): string;

  /**
   * Returns any additional options that are to be passed to the {@link Page#screenshot} method belonging to
   * `puppeteer-core` based on the `options` provided.
   *
   * This method returns an empty object to indicate that no additional options are to be passed, and any options
   * returned by this method will override the core options, where applicable.
   *
   * @param options The parsed convert options.
   * @return Any additional options for {@link Page#screenshot}.
   */
  getScreenshotOptions(options: ConvertOptionsParsed): ScreenshotOptions;

  /**
   * Parses and validates any additional options within `options` not present in `parsedOptions` for {@link IConverter}
   * that are applicable to this {@link IProvider}.
   *
   * This method should not mutate either of the arguments and instead return a new options object consisting of
   * `parsedOptions` as well as any options added by this {@link IProvider}.
   *
   * An error will occur if any of the options are invalid.
   *
   * @param options The original options being parsed.
   * @param parsedOptions The parsed core options.
   * @return The parsed options.
   * @throws {Error} If an applicable option with `options` is invalid.
   */
  parseConverterOptions(
    options: ConvertOptions | undefined,
    parsedOptions: IConverterConvertOptionsParsed,
  ): ConvertOptionsParsed;
}
