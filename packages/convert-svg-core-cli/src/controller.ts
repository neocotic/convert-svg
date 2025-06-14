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

import { writeFile } from "node:fs/promises";
import { EOL } from "node:os";
import { resolve } from "node:path";
import type { Writable } from "node:stream";
import chalk from "chalk";
import { type Command, type OptionValues, createCommand } from "commander";
import {
  Converter,
  type IConvertFileFuncOptions,
  type IConvertFuncOptions,
  type IConverter,
  type IConverterConvertOptions,
  type IConverterConvertOptionsParsed,
} from "convert-svg-core";
import getStdin from "get-stdin";
import { glob } from "glob";
import { executablePath } from "puppeteer";
import type { IPackage, IPackageSupplier } from "./package.js";
import type { ICommandOption, ICommandProvider } from "./provider.js";

/**
 * A CLI controller for an SVG converter {@link ICommandProvider}.
 *
 * While technically part of the API, this is not expected to be used externally as its only intended use is by
 * `convert-svg-to-*` packages.
 */
export interface IController<
  ConvertOptions extends IConverterConvertOptions,
  ConvertOptionsParsed extends IConverterConvertOptionsParsed,
> {
  /**
   * The {@link ICommandProvider} for this {@link IController}.
   */
  readonly provider: ICommandProvider<ConvertOptions, ConvertOptionsParsed>;

  /**
   * Writes the specified `message` to the error stream for this {@link IController}.
   *
   * @param message The message to be written to the error stream.
   */
  error(message: string): void;

  /**
   * Writes a message to the error stream for this {@link IController} indicating that it has failed and then will exit
   * the current process.
   *
   * @param error The error responsible for the failure.
   */
  fail(error: unknown): never;

  /**
   * Writes the specified `message` to the output stream for this {@link IController}.
   *
   * @param message The message to be written to the output stream.
   */
  output(message: string): void;

  /**
   * Parses the command-line (process) arguments provided and performs the necessary actions based on the parsed input.
   *
   * An error will occur if any problem arises.
   *
   * @param args The arguments to be parsed.
   */
  parse(args?: string[]): Promise<void>;
}

/**
 * The options that can be used to construct an implementation of {@link IController}.
 */
export interface IControllerOptions<
  ConvertOptions extends IConverterConvertOptions,
  ConvertOptionsParsed extends IConverterConvertOptionsParsed,
> {
  /**
   * The base directory to be used. This is primarily intended for testing purposes.
   *
   * @defaultValue process.cwd()
   */
  baseDir?: string;
  /**
   * The name of the command to be used. If omitted, the package name will be used.
   */
  commandName?: string;
  /**
   * The stream for error messages to be written to. This is primarily intended for testing purposes.
   *
   * @defaultValue process.stderr
   */
  errorStream?: Writable;
  /**
   * The stream for output messages to be written to. This is primarily intended for testing purposes.
   *
   * @defaultValue process.stdout
   */
  outputStream?: Writable;
  /**
   * The {@link IPackageSupplier} to be used to get the package information (e.g. version).
   */
  package: IPackageSupplier;
  /**
   * The {@link ICommandProvider} to be used.
   */
  provider: ICommandProvider<ConvertOptions, ConvertOptionsParsed>;
}

/**
 * An implementation of {@IController}.
 */
export class Controller<
  ConvertOptions extends IConverterConvertOptions,
  ConvertOptionsParsed extends IConverterConvertOptionsParsed,
> implements IController<ConvertOptions, ConvertOptionsParsed>
{
  /**
   * Creates an instance of {@link Controller} with the specified `options`.
   *
   * An error will occur if unable to retrieve the package information.
   *
   * @param options The options to be used.
   * @return A newly created {@link Controller} instance.
   */
  static async create<
    ConvertOptions extends IConverterConvertOptions,
    ConvertOptionsParsed extends IConverterConvertOptionsParsed,
  >(
    options: IControllerOptions<ConvertOptions, ConvertOptionsParsed>,
  ): Promise<Controller<ConvertOptions, ConvertOptionsParsed>> {
    const pkg = await options.package();

    return new Controller({
      baseDir: options.baseDir || process.cwd(),
      commandName: options.commandName || pkg.name,
      errorStream: options.errorStream || process.stderr,
      outputStream: options.outputStream || process.stdout,
      package: pkg,
      provider: options.provider,
    });
  }

  static #createCommand<
    ConvertOptions extends IConverterConvertOptions,
    ConvertOptionsParsed extends IConverterConvertOptionsParsed,
  >(
    provider: ICommandProvider<ConvertOptions, ConvertOptionsParsed>,
    pkg: IPackage,
  ): Command {
    const format = provider.format.toUpperCase();
    const command = createCommand()
      .version(pkg.version)
      .usage("[options] [files...]")
      .argument("[files...]");
    const commandOptions: ICommandOption[] = [
      {
        flags: "--no-color",
        description: "disables color output",
      },
      {
        flags: "--background <color>",
        description: "specify background color for transparent regions in SVG",
      },
      {
        flags: "--base-url <url>",
        description: "specify base URL to use for all relative URLs in SVG",
      },
      {
        flags: "--filename <filename>",
        description: `specify filename for the ${format} output when processing STDIN`,
      },
      {
        flags: "--height <value>",
        description: `specify height for ${format}`,
      },
      {
        flags: "--launch <json>",
        description:
          "specify a json object passed to puppeteer when launching a browser",
        transformer: JSON.parse,
      },
      {
        flags: "--page <json>",
        description: "specify a json object passed to puppeteer opening a page",
        transformer: JSON.parse,
      },
      {
        flags: "--rounding <type>",
        description: "specify type of rounding to apply to dimensions",
      },
      {
        flags: "--scale <value>",
        description: "specify scale to apply to dimensions [1]",
        transformer: parseInt,
      },
      {
        flags: "--width <value>",
        description: `specify width for ${format}`,
      },
      ...provider.commandOptions,
    ];

    for (const commandOption of commandOptions) {
      command.option(
        commandOption.flags,
        commandOption.description,
        commandOption.transformer ?? ((value: string): unknown => value),
      );
    }

    return command;
  }

  static #getErrorMessage(error: unknown): string {
    if (typeof error === "object" && error) {
      if ("stack" in error && error.stack) {
        return `${error.stack}`;
      }
      if ("message" in error && error.message) {
        return `${error.message}`;
      }
    }
    return `${error}`;
  }

  readonly #baseDir: string;
  readonly #command: Command;
  readonly #commandName: string;
  readonly #errorStream: Writable;
  readonly #outputStream: Writable;
  readonly #provider: ICommandProvider<ConvertOptions, ConvertOptionsParsed>;

  private constructor(
    options: ControllerOptions<ConvertOptions, ConvertOptionsParsed>,
  ) {
    this.#baseDir = options.baseDir;
    this.#command = Controller.#createCommand(
      options.provider,
      options.package,
    );
    this.#commandName = options.commandName;
    this.#errorStream = options.errorStream;
    this.#outputStream = options.outputStream;
    this.#provider = options.provider;
  }

  error(message: string): void {
    this.#errorStream.write(`${message}${EOL}`);
  }

  fail(error: unknown): never {
    const message = Controller.#getErrorMessage(error);

    this.#errorStream.write(`${this.#commandName} failed: ${message}${EOL}`);

    process.exit(1);
  }

  output(message: string): void {
    this.#outputStream.write(`${message}${EOL}`);
  }

  async parse(args: string[] = []): Promise<void> {
    const command = this.#command.parse(args);
    const commandOptions = command.opts();
    const { filename: fileName } = commandOptions;
    const parsedOptions = this.#parseOptions(command, commandOptions);

    const converter = await Converter.create({
      ...parsedOptions,
      provider: this.#provider,
    });

    try {
      if (command.args.length) {
        const filePaths = [];

        for (const arg of command.args) {
          const files = await glob(arg, {
            absolute: true,
            cwd: this.#baseDir,
            nodir: true,
          });

          filePaths.push(...files);
        }

        await this.#convertFiles(converter, filePaths, parsedOptions);
      } else {
        const input = await getStdin.buffer();

        await this.#convertInput(
          converter,
          input,
          parsedOptions,
          fileName ? resolve(this.#baseDir, fileName) : undefined,
        );
      }
    } finally {
      await converter.close();
    }
  }

  async #convertFiles(
    converter: IConverter<ConvertOptions, ConvertOptionsParsed>,
    filePaths: string[],
    options: IConvertFileFuncOptions<ConvertOptions, ConvertOptionsParsed>,
  ): Promise<void> {
    for (const inputFilePath of filePaths) {
      const outputFilePath = await converter.convertFile(
        inputFilePath,
        options,
      );

      this.output(
        `Converted SVG file to ${this.#provider.format} file: ` +
          `${chalk.blue(inputFilePath)} -> ${chalk.blue(outputFilePath)}`,
      );
    }

    this.output(chalk.green("Done!"));
  }

  async #convertInput(
    converter: IConverter<ConvertOptions, ConvertOptionsParsed>,
    input: Buffer,
    options: IConvertFuncOptions<ConvertOptions, ConvertOptionsParsed>,
    filePath?: string,
  ) {
    if (!options.baseUrl) {
      options.baseFile = this.#baseDir;
    }

    const output = await converter.convert(input, options);

    if (filePath) {
      await writeFile(filePath, output);

      this.output(
        `Converted SVG input to ${this.#provider.format} file: ${chalk.blue(filePath)}`,
      );
      this.output(chalk.green("Done!"));
    } else {
      this.#outputStream.write(output);
    }
  }

  #parseOptions(
    command: Command,
    commandOptions: OptionValues,
  ): IConvertFuncOptions<ConvertOptions, ConvertOptionsParsed> {
    const parsedOptions = this.#provider.parseCommandOptions(command, {
      background: commandOptions.background,
      baseUrl: commandOptions.baseUrl,
      height: commandOptions.height,
      rounding: commandOptions.rounding,
      scale: commandOptions.scale,
      width: commandOptions.width,
    });
    const { launch, page } = commandOptions;

    return {
      ...parsedOptions,
      launch: {
        executablePath: executablePath(),
        ...launch,
      },
      page,
    };
  }

  get provider(): ICommandProvider<ConvertOptions, ConvertOptionsParsed> {
    return this.#provider;
  }
}

type ControllerOptions<
  ConvertOptions extends IConverterConvertOptions,
  ConvertOptionsParsed extends IConverterConvertOptionsParsed,
> = Pick<
  IControllerOptions<ConvertOptions, ConvertOptionsParsed>,
  "provider"
> & {
  baseDir: string;
  commandName: string;
  errorStream: Writable;
  outputStream: Writable;
  package: IPackage;
};
