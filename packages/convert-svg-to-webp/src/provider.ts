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

import type {
  IConverterConvertOptions,
  IConverterConvertOptionsParsed,
  IProvider,
} from "convert-svg-core";
import type { ImageFormat, ScreenshotOptions } from "puppeteer-core";

/**
 * The options that can be passed to {@link IConverter#convert} via {@link WebpProvider}.
 */
export interface WebpProviderConvertOptions extends IConverterConvertOptions {
  /**
   * The quality of the output to be generated.
   *
   * @defaultValue 100
   */
  quality?: number;
}

/**
 * The options that can be passed to {@link IConverter#convert} via {@link WebpProvider} after being parsed.
 */
export interface WebpProviderConvertOptionsParsed
  extends IConverterConvertOptionsParsed {
  /**
   * The quality of the output to be generated.
   */
  quality: number;
}

/**
 * An {@link IProvider} implementation to support WEBP as an output format for SVG conversion.
 */
export class WebpProvider
  implements
    IProvider<WebpProviderConvertOptions, WebpProviderConvertOptionsParsed>
{
  /**
   * The default background color option value to be used when {@link WebpProviderConvertOptions#background} is omitted.
   */
  protected static readonly defaultBackgroundColor = "transparent";
  /**
   * The default quality option value to be used when {@link WebpProviderConvertOptions#quality} is omitted.
   */
  protected static readonly defaultQuality = 100;

  getBackgroundColor(options: WebpProviderConvertOptionsParsed): string {
    return options.background || WebpProvider.defaultBackgroundColor;
  }

  getScreenshotOptions(
    options: WebpProviderConvertOptionsParsed,
  ): ScreenshotOptions {
    return { quality: options.quality };
  }

  parseConverterOptions(
    options: WebpProviderConvertOptions | undefined,
    parsedOptions: IConverterConvertOptionsParsed,
  ): WebpProviderConvertOptionsParsed {
    if (typeof options?.quality !== "number") {
      return {
        ...parsedOptions,
        quality: WebpProvider.defaultQuality,
      };
    }

    if (options.quality < 0 || options.quality > 100) {
      throw new Error(
        "Value for quality option out of range. Use value between 0-100 (inclusive)",
      );
    }

    return {
      ...parsedOptions,
      quality: options.quality,
    };
  }

  get extension(): string {
    return "webp";
  }

  get format(): ImageFormat {
    return "webp";
  }
}
