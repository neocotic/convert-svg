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
import { afterEach, beforeEach, describe, it } from "node:test";
import { Browser, BrowserContext } from "puppeteer-core";
import {
  type SinonStubbedFunction,
  type SinonStubbedMember,
  stub,
} from "sinon";
import {
  Converter,
  type IConverterConvertOptions,
  type IConverterConvertOptionsParsed,
} from "../src/converter.js";
import {
  type IConvertFileFuncOptions,
  type IConvertFuncOptions,
  type IFuncDefinitions,
  defineFunctions,
} from "../src/function.js";
import type { IProvider } from "../src/provider.js";

describe("[convert-svg-core] function -> defineFunctions", () => {
  let browser: Browser;
  let browserCreateBrowserContext: SinonStubbedFunction<
    Browser["createBrowserContext"]
  >;
  let converterClose: SinonStubbedFunction<
    Converter<IConverterConvertOptions, IConverterConvertOptionsParsed>["close"]
  >;
  let converterConvert: SinonStubbedMember<
    Converter<
      IConverterConvertOptions,
      IConverterConvertOptionsParsed
    >["convert"]
  >;
  let converterConvertFile: SinonStubbedMember<
    Converter<
      IConverterConvertOptions,
      IConverterConvertOptionsParsed
    >["convertFile"]
  >;
  let funcs: IFuncDefinitions<
    IConverterConvertOptions,
    IConverterConvertOptionsParsed
  >;
  let provider: IProvider<
    IConverterConvertOptions,
    IConverterConvertOptionsParsed
  >;

  beforeEach(() => {
    browserCreateBrowserContext = stub();

    browser = {
      connected: true,
      createBrowserContext: browserCreateBrowserContext,
    } as Partial<Browser> as Browser;
    const browserContext: Partial<BrowserContext> = {};

    browserCreateBrowserContext.resolves(browserContext as BrowserContext);

    converterClose = stub(Converter.prototype, "close");
    converterConvert = stub(Converter.prototype, "convert");
    converterConvertFile = stub(Converter.prototype, "convertFile");

    provider = {} as IProvider<
      IConverterConvertOptions,
      IConverterConvertOptionsParsed
    >;

    funcs = defineFunctions(provider);
  });

  afterEach(() => {
    converterClose.restore();
    converterConvert.restore();
    converterConvertFile.restore();
  });

  describe("#convert", () => {
    describe("when converter#convert resolves successfully", () => {
      it("should return resolved output buffer and destroy created converter", async () => {
        const expected = Buffer.from("done");
        const input = Buffer.from("<svg></svg>");
        const options: IConvertFuncOptions<
          IConverterConvertOptions,
          IConverterConvertOptionsParsed
        > = {
          browser,
          background: "#000",
        };

        converterConvert.resolves(expected);

        const actual = await funcs.convert(input, options);

        assert.strictEqual(actual, expected);
        assert.equal(converterConvert.callCount, 1);
        assert.deepEqual(converterConvert.args, [[input, options]]);
        assert.equal(converterConvertFile.callCount, 0);
        assert.equal(converterClose.callCount, 1);
      });
    });

    describe("when converter#convert rejects", () => {
      it("should return rejected error and destroy created converter", async () => {
        const expected = new Error("bad");
        const input = Buffer.from("<svg></svg>");
        const options: IConvertFuncOptions<
          IConverterConvertOptions,
          IConverterConvertOptionsParsed
        > = {
          browser,
          background: "#000",
        };

        converterConvert.rejects(expected);

        await assert.rejects(funcs.convert(input, options), expected);

        assert.equal(converterConvert.callCount, 1);
        assert.deepEqual(converterConvert.args, [[input, options]]);
        assert.equal(converterConvertFile.callCount, 0);
        assert.equal(converterClose.callCount, 1);
      });
    });
  });

  describe("#convertFile", () => {
    describe("when converter#convertFile resolves successfully", () => {
      it("should return resolved output buffer and destroy created converter", async () => {
        const expected = "output.png";
        const inputFilePath = "test.svg";
        const options: IConvertFileFuncOptions<
          IConverterConvertOptions,
          IConverterConvertOptionsParsed
        > = {
          browser,
          background: "#000",
        };

        converterConvertFile.resolves(expected);

        const actual = await funcs.convertFile(inputFilePath, options);

        assert.strictEqual(actual, expected);
        assert.equal(converterConvertFile.callCount, 1);
        assert.deepEqual(converterConvertFile.args, [[inputFilePath, options]]);
        assert.equal(converterConvert.callCount, 0);
        assert.equal(converterClose.callCount, 1);
      });
    });

    describe("when converter#convertFile rejects", () => {
      it("should return rejected error and destroy created converter", async () => {
        const expected = new Error("bad");
        const inputFilePath = "test.svg";
        const options: IConvertFileFuncOptions<
          IConverterConvertOptions,
          IConverterConvertOptionsParsed
        > = {
          browser,
          background: "#000",
        };

        converterConvertFile.rejects(expected);

        await assert.rejects(
          funcs.convertFile(inputFilePath, options),
          expected,
        );

        assert.equal(converterConvertFile.callCount, 1);
        assert.deepEqual(converterConvertFile.args, [[inputFilePath, options]]);
        assert.equal(converterConvert.callCount, 0);
        assert.equal(converterClose.callCount, 1);
      });
    });
  });

  describe("#createConverter", () => {
    it("should return Converter instance using provider", async () => {
      const converter = await funcs.createConverter({ browser });

      assert.ok(converter instanceof Converter);
      assert.strictEqual(converter.provider, provider);
    });

    it("should never return same instance", async () => {
      const options = { browser };

      assert.notStrictEqual(
        await funcs.createConverter(options),
        await funcs.createConverter(options),
      );
    });
  });
});
