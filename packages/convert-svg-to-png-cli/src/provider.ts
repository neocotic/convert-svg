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
import type {
  IConverterConvertOptions,
  IConverterConvertOptionsParsed,
} from "convert-svg-core";
import type { ICommandOption, ICommandProvider } from "convert-svg-core-cli";
import { PngProvider } from "convert-svg-to-png";

/**
 * An extension of {@link PngProvider} that implements {@link ICommandProvider} to support SVG to PNG conversion via
 * CLI.
 */
export class PngCommandProvider
  extends PngProvider
  implements
    ICommandProvider<IConverterConvertOptions, IConverterConvertOptionsParsed>
{
  parseCommandOptions(
    _command: Command,
    options: IConverterConvertOptions,
  ): IConverterConvertOptions {
    return options;
  }

  get commandOptions(): ICommandOption[] {
    return [];
  }
}
