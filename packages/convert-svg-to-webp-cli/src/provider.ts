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

import type { Command } from "commander";
import type { IConverterConvertOptions } from "convert-svg-core";
import type { ICommandOption, ICommandProvider } from "convert-svg-core-cli";
import {
  WebpProvider,
  type WebpProviderConvertOptions,
  type WebpProviderConvertOptionsParsed,
} from "convert-svg-to-webp";

/**
 * An extension of {@link WebpProvider} that implements {@link ICommandProvider} to support SVG to WEBP conversion via
 * CLI.
 */
export class WebpCommandProvider
  extends WebpProvider
  implements
    ICommandProvider<
      WebpProviderConvertOptions,
      WebpProviderConvertOptionsParsed
    >
{
  parseCommandOptions(
    command: Command,
    options: IConverterConvertOptions,
  ): WebpProviderConvertOptions {
    const commandOptions = command.opts();
    return {
      ...options,
      quality: commandOptions.quality,
    };
  }

  get commandOptions(): ICommandOption[] {
    return [
      {
        flags: "--quality <value>",
        description: `specify quality for WEBP [${WebpCommandProvider.defaultQuality}]`,
        transformer: parseInt,
      },
    ];
  }
}
