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

import * as assert from "node:assert";
import { readFileSync } from "node:fs";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import type { TestContext } from "node:test";
import {
  Converter,
  type IConverter,
  type IConverterConvertFileOptions,
  type IConverterConvertOptions,
  type IConverterConvertOptionsParsed,
  type IProvider,
} from "convert-svg-core";
import { deleteAsync } from "del";
import fileUrl from "file-url";
import looksSame, { type LooksSameOptions } from "looks-same";
import { executablePath } from "puppeteer";
import { z } from "zod";
import { sourceDirname } from "./source-dirname.js";

/**
 * Describes a test involving a fixture file.
 *
 * Either {@link #error} or {@link #message} must be specified, but not both.
 */
export interface ITest<ConvertOptions extends IConverterConvertOptions> {
  /**
   * The options to control the assertion used when comparing the actual and expected outputs for this test.
   *
   * These options are merged on top of any that may have been passed to the {@link ITestRunner} and provide the most
   * granular control.
   */
  assertion?: ITestAssertion;
  /**
   * Whether this test is internal to the `convert-svg-core-test` module.
   */
  core?: boolean;
  /**
   * The message for the error expected to be thrown as a result of running this test. Cannot be specified if
   * {@link #message} has also been specified.
   */
  error?: string;
  /**
   * The name of the fixture file to be used for this test.
   */
  file: string;
  /**
   * Whether the `baseFile` option is to be added to the options.
   */
  includeBaseFile?: boolean;
  /**
   * Whether the `baseUrl` option is to be added to the options.
   */
  includeBaseUrl?: boolean;
  /**
   * The message describing this test. Cannot be specified if {@link #error} has also been specified.
   */
  message?: string;
  /**
   * The name of this test.
   */
  name: string;
  /**
   * Whether only this test should be run.
   */
  only?: boolean;
  /**
   * The options to be passed to the convert method. May be modified if either {@link #includeBaseFile} or
   * {@link includeBaseUrl} are enabled.
   */
  options?: ConvertOptions;
  /**
   * Whether this test is to be skipped.
   */
  skip?: boolean;
}

/**
 * Provides configurable options to control the assertion used when comparing the actual and expected outputs.
 */
export type ITestAssertion = Omit<LooksSameOptions, "createDiffImage">;

/**
 * Contains methods for testing the core convert methods and to ensure consistency across all target formats.
 */
export interface ITestRunner<
  ConvertOptions extends IConverterConvertOptions,
  ConvertOptionsParsed extends IConverterConvertOptionsParsed,
> {
  /**
   * The {@link IProvider} being tested by this {@link ITestRunner}.
   */
  readonly provider: IProvider<ConvertOptions, ConvertOptionsParsed>;

  /**
   * Describes each test for both the {@link IConverter#convert} and {@link IConverter#convertFile} methods.
   *
   * If this method is used, {@link #describeConverterConvert} and {@link #describeConverterConvertFile} should not be
   * called.
   *
   * @param t The current test cotext.
   */
  describeConverter(t: TestContext): Promise<void>;

  /**
   * Describes each test for the {@link IConverter#convert} method.
   *
   * If this method is used, {@link #describeConverter} should not be called.
   *
   * @param t The current test cotext.
   */
  describeConverterConvert(t: TestContext): Promise<void>;

  /**
   * Describes each test for the {@link IConverter#convertFile} method.
   *
   * If this method is used, {@link #describeConverter} should not be called.
   *
   * @param t The current test cotext.
   */
  describeConverterConvertFile(t: TestContext): Promise<void>;
}

const TestSchema = z.object({
  assertion: z.record(z.string(), z.unknown()).optional(),
  core: z.boolean().optional(),
  error: z.string().optional(),
  file: z.string().nonempty().endsWith(".svg"),
  includeBaseFile: z.boolean().optional(),
  includeBaseUrl: z.boolean().optional(),
  message: z.string().nonempty().optional(),
  name: z.string().nonempty(),
  only: z.boolean().optional(),
  options: z.record(z.string(), z.unknown()).optional(),
  skip: z.boolean().optional(),
});

/**
 * An implementation of {@link ITestRunner}.
 */
export class TestRunner<
  ConvertOptions extends IConverterConvertOptions,
  ConvertOptionsParsed extends IConverterConvertOptionsParsed,
> implements ITestRunner<ConvertOptions, ConvertOptionsParsed>
{
  static #coreTestCache: ITest<IConverterConvertOptions>[] | undefined;
  static readonly #defaultAssertion: ITestAssertion = {
    tolerance: 2.8, // Default is 2.3
  };

  static #getCoreTests<
    ConvertOptions extends IConverterConvertOptions,
  >(): ITest<ConvertOptions>[] {
    if (!TestRunner.#coreTestCache) {
      TestRunner.#coreTestCache = JSON.parse(
        readFileSync(resolve(sourceDirname, "../../test/tests.json"), "utf8"),
      ) as ITest<IConverterConvertOptions>[];
    }

    return TestRunner.#coreTestCache.map((test) => {
      const clone = structuredClone(
        TestSchema.parse(test),
      ) as ITest<ConvertOptions>;
      clone.core = true;
      return clone;
    });
  }

  static #isErrorWithCode(error: unknown, code: string): boolean {
    return (
      typeof error === "object" &&
      !!error &&
      "code" in error &&
      error.code === code
    );
  }

  readonly #assertion: ITestAssertion;
  readonly #baseDir: string;
  readonly #isPreGenerateOutputFilesEnabled: boolean;
  readonly #isRetainOutputFilesEnabled: boolean;
  readonly #provider: IProvider<ConvertOptions, ConvertOptionsParsed>;
  readonly #tests: ITest<ConvertOptions>[];

  /**
   * Creates an instance of {@link TestRunner} using the `options` provided.
   *
   * @param options The options to be used.
   * @throws {Error} If unable to load the file containing core tests or a test is invalid.
   */
  constructor(
    options: TestRunnerOptions<ConvertOptions, ConvertOptionsParsed>,
  ) {
    const tests = TestRunner.#getCoreTests<ConvertOptions>();
    if (options.tests) {
      options.tests.forEach((test) =>
        tests.push(
          structuredClone(TestSchema.parse(test)) as ITest<ConvertOptions>,
        ),
      );
    }

    this.#assertion = { ...TestRunner.#defaultAssertion, ...options.assertion };
    this.#baseDir = options.baseDir;
    this.#isPreGenerateOutputFilesEnabled =
      options.preGenerateOutputFiles ?? false;
    this.#provider = options.provider;
    this.#isRetainOutputFilesEnabled =
      options.retainOutputFiles ?? this.#isPreGenerateOutputFilesEnabled;
    this.#tests = tests;
  }

  async describeConverter(t: TestContext): Promise<void> {
    await t.test("convert", this.describeConverterConvert.bind(this));

    await t.test("convertFile", this.describeConverterConvertFile.bind(this));
  }

  async describeConverterConvert(t: TestContext): Promise<void> {
    let converter: IConverter<ConvertOptions, ConvertOptionsParsed>;

    t.before(async () => {
      converter = await this.#createConverter();
    });

    t.after(async () => {
      await converter.close();
    });

    await Promise.allSettled(
      this.#tests.map((test, index) => {
        const id = this.#getTestId(test, index);

        return t.test(
          `(test:${id}) ${test.name} (input:${test.file})`,
          { only: test.only, skip: test.skip },
          async (t) => {
            const message = test.error ? "should throw an error" : test.message;

            let inputFilePath: string;
            let input: Buffer;
            let options: ConvertOptions;
            let expectedFilePath: string;
            let expected: Buffer;

            t.before(async () => {
              const { extension } = this.#provider;
              inputFilePath = this.#getFixtureFilePath(
                "input",
                test.file,
                test.core,
              );
              input = await readFile(inputFilePath);
              options = this.#parseOptions(test, inputFilePath);

              if (!test.error) {
                expectedFilePath = this.#getFixtureFilePath(
                  "expected",
                  `${id}.${extension}`,
                );
                expected = await readFile(expectedFilePath);
              }
            });

            await t.test(message, async () => {
              if (test.error) {
                await assert.rejects(
                  converter.convert(input, options),
                  {
                    message: test.error,
                  },
                  "should reject with expected error",
                );
              } else {
                const actual = await converter.convert(input, options);

                await this.#assertLooksSame(
                  test,
                  actual,
                  expected,
                  "should resolve with expected output",
                );
              }
            });
          },
        );
      }),
    );

    await t.test(
      `(test:${this.#tests.length}) when input is a string`,
      async (t) => {
        let inputFilePath: string;
        let input: string;
        let expectedFilePath: string;
        let expected: Buffer;
        let test: ITest<ConvertOptions>;

        t.before(async () => {
          const { extension } = this.#provider;
          const successTest = this.#tests.find((t) => !(t.error && t.skip));

          assert.ok(successTest, "should have success test case");

          test = successTest;

          inputFilePath = this.#getFixtureFilePath(
            "input",
            test.file,
            test.core,
          );
          input = await readFile(inputFilePath, "utf8");
          expectedFilePath = this.#getFixtureFilePath(
            "expected",
            `0${test.core ? "-core" : ""}.${extension}`,
          );
          expected = await readFile(expectedFilePath);
        });

        await t.test(
          "should convert SVG string to converted output buffer",
          async () => {
            const actual = await converter.convert(input);

            await this.#assertLooksSame(
              test,
              actual,
              expected,
              "should resolve with expected output",
            );
          },
        );
      },
    );
  }

  async describeConverterConvertFile(t: TestContext): Promise<void> {
    let converter: IConverter<ConvertOptions, ConvertOptionsParsed>;

    t.before(async () => {
      try {
        await mkdir(this.#getFixtureDirPath("actual"));
      } catch (e) {
        if (!TestRunner.#isErrorWithCode(e, "EEXIST")) {
          throw e;
        }
      }

      converter = await this.#createConverter();

      if (this.#isPreGenerateOutputFilesEnabled) {
        await this.#preGenerateOutputFiles(converter);
      }
    });

    t.after(async () => {
      await converter.close();

      if (!this.#isRetainOutputFilesEnabled) {
        await deleteAsync(this.#getFixtureDirPath("actual"));
      }
    });

    await Promise.allSettled(
      this.#tests.map((test, index) => {
        const id = this.#getTestId(test, index);

        return t.test(
          `(test:${id}) ${test.name} (input:${test.file})`,
          { only: test.only, skip: test.skip },
          async (t) => {
            const message = test.error ? "should throw an error" : test.message;

            let outputFilePath: string;
            let inputFilePath: string;
            let options: IConverterConvertFileOptions<ConvertOptions>;
            let expectedFilePath: string;
            let expected: Buffer | undefined;

            t.before(async () => {
              const { extension } = this.#provider;
              outputFilePath = this.#getFixtureFilePath(
                "actual",
                `${id}.${extension}`,
              );
              inputFilePath = this.#getFixtureFilePath(
                "input",
                test.file,
                test.core,
              );
              options = this.#parseOptions(test, inputFilePath, outputFilePath);

              if (!test.error) {
                expectedFilePath = this.#getFixtureFilePath(
                  "expected",
                  `${id}.${extension}`,
                );
                expected = await readFile(expectedFilePath);
              }
            });

            await t.test(message, async () => {
              if (test.error) {
                await assert.rejects(
                  converter.convertFile(inputFilePath, options),
                  {
                    message: test.error,
                  },
                  "should reject with expected error",
                );
              } else {
                assert.ok(expected, "should have expected output");

                const actualFilePath = await converter.convertFile(
                  inputFilePath,
                  options,
                );
                const actual = await readFile(outputFilePath);

                assert.equal(
                  actualFilePath,
                  outputFilePath,
                  "should resolve with expected output file path",
                );

                await this.#assertLooksSame(
                  test,
                  actual,
                  expected,
                  this.#isRetainOutputFilesEnabled
                    ? `should write expected output file: re-run test with "retainOutputFiles" option enabled for TestRunner and manually compare expected file (${expectedFilePath}) with actual file (${actualFilePath})`
                    : `should write expected output file: manually compare expected file (${expectedFilePath}) with actual file (${actualFilePath})`,
                );
              }
            });
          },
        );
      }),
    );
  }

  async #assertLooksSame(
    test: ITest<ConvertOptions>,
    actual: Buffer,
    expected: Buffer,
    message?: string,
  ): Promise<void> {
    const diff = await looksSame(actual, expected, {
      ...this.#assertion,
      ...test.assertion,
    });

    assert.ok(diff.equal, message);
  }

  #createConverter(): Promise<
    IConverter<ConvertOptions, ConvertOptionsParsed>
  > {
    return Converter.create({
      launch: { executablePath: executablePath() },
      provider: this.#provider,
    });
  }

  #getFixtureDirPath(dirName: string, core?: boolean): string {
    return core
      ? resolve(sourceDirname, "../../test/fixtures", dirName)
      : join(this.#baseDir, "fixtures", dirName);
  }

  #getFixtureFilePath(
    dirName: string,
    fileName: string,
    core?: boolean,
  ): string {
    return join(this.#getFixtureDirPath(dirName, core), fileName);
  }

  #getTestId(test: ITest<ConvertOptions>, index: number): string {
    return `${index}${test.core ? "-core" : ""}`;
  }

  #parseOptions(
    test: ITest<ConvertOptions>,
    inputFilePath: string,
    outputFilePath?: string,
  ): IConverterConvertFileOptions<ConvertOptions> {
    const options = { ...test.options } as ConvertOptions;
    if (test.includeBaseFile) {
      options.baseFile = inputFilePath;
    }
    if (test.includeBaseUrl) {
      options.baseUrl = fileUrl(inputFilePath);
    }

    return {
      ...options,
      outputFilePath,
    };
  }

  async #preGenerateOutputFiles(
    converter: IConverter<ConvertOptions, ConvertOptionsParsed>,
  ): Promise<void> {
    try {
      await mkdir(this.#getFixtureDirPath("actual"));
    } catch (e) {
      if (!TestRunner.#isErrorWithCode(e, "EEXIST")) {
        throw e;
      }
    }

    const { extension } = this.#provider;
    let index = -1;

    for (const test of this.#tests) {
      index++;

      if (test.error) {
        continue;
      }

      const inputFilePath = this.#getFixtureFilePath(
        "input",
        test.file,
        test.core,
      );
      const actualFilePath = this.#getFixtureFilePath(
        "actual",
        `${this.#getTestId(test, index)}.${extension}`,
      );

      try {
        const input = await readFile(inputFilePath);
        const opts = this.#parseOptions(test, inputFilePath);

        const actual = await converter.convert(input, opts);

        await writeFile(actualFilePath, actual);
      } catch (e) {
        console.warn(
          `Failed to pre-generate output file (${actualFilePath}): ${e}`,
        );
      }
    }
  }

  get provider(): IProvider<ConvertOptions, ConvertOptionsParsed> {
    return this.#provider;
  }
}

/**
 * The options that can be used to construct a {@link TestRunner}.
 */
export interface TestRunnerOptions<
  ConvertOptions extends IConverterConvertOptions,
  ConvertOptionsParsed extends IConverterConvertOptionsParsed,
> {
  /**
   * The options to control the assertion used when comparing the actual and expected outputs for each test.
   *
   * These options are merged on top of sensible defaults for comparing converted SVG outputs and are typically most
   * suited for applying output format-specific defaults.
   */
  assertion?: LooksSameOptions;
  /**
   * The path for the base directory of the tests.
   */
  baseDir: string;
  /**
   * Whether to convert all test input files and write their outputs to the `fixtures/actual` directory before the
   * {@link IConverter#convertFile} test suite.
   *
   * This option can be extremely useful for creating expected files for new tests, updating existing ones after
   * changes/improvements within Chromium, and primarily to debug tests failing due to mismatching images.
   *
   * Error tests are ignored as they have no expected output.
   *
   * An error will occur if any problem arises while loading the tests or trying to read/write any files or convert an
   * SVG into another format.
   *
   * Enabling this option will implicitly enable {@link #retainOutputFiles} unless that option has been explicitly set
   * to `false`.
   */
  preGenerateOutputFiles?: boolean;
  /**
   * The {@link IProvider} to be tested.
   */
  provider: IProvider<ConvertOptions, ConvertOptionsParsed>;
  /**
   * Whether to retain the `fixtures/actual` directory and its contents after the test suite has finished.
   *
   * Since this directory is the {@link IConverter#convertFile} test suite writes output files, this option can be
   * extremely useful for updating existing ones after changes/improvements within Chromium, and primarily to debug
   * tests failing due to mismatching images.
   */
  retainOutputFiles?: boolean;
  /**
   * Any additional tests to be run after the core tests.
   */
  tests?: ITest<ConvertOptions>[];
}
