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
  IProvider,
} from "convert-svg-core";

/**
 * Describes a CLI option.
 */
export interface ICommandOption {
  /**
   * The description to be used when displaying help information for this option.
   */
  readonly description: string;
  /**
   * The flags to be accepted by this option.
   */
  readonly flags: string;
  /**
   * A function to be used to transform the argument of this option, where applicable.
   *
   * When omitted, the argument string value will be used as-is.
   *
   * @param value The original argument string value.
   * @return The transformed value.
   */
  readonly transformer?: (value: string) => unknown;
}

/**
 * Supports a single output format for SVG conversion via CLI.
 */
export interface ICommandProvider<
  ConvertOptions extends IConverterConvertOptions,
  ConvertOptionsParsed extends IConverterConvertOptionsParsed,
> extends IProvider<ConvertOptions, ConvertOptionsParsed> {
  /**
   * Any additional command options that are supported by this {@link ICommandProvider} on top of the core command
   * options.
   *
   * This array is empty if there are no additional command options are available.
   */
  readonly commandOptions: ICommandOption[];

  /**
   * Extracts and merges any additional options within `command` not present in `options` for {@link IController} into
   * options for {@link IConverter} that are applicable to this {@link ICommandProvider}.
   *
   * This method should not mutate either of the arguments and instead return a new options object consisting of
   * `options` as well as any options added by this {@link ICommandProvider}.
   *
   * Validation does not need to be performed by this method as this should be done by
   * {@link ICommandProvider#parseConverterOptions}.
   *
   * @param command The command from which the options are being parsed.
   * @param options The core options.
   * @return The core options merged with any additional options.
   */
  parseCommandOptions(
    command: Command,
    options: IConverterConvertOptions,
  ): ConvertOptions;
}
