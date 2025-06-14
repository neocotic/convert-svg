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
import { beforeEach, describe, it } from "node:test";
import { Browser, BrowserContext } from "puppeteer-core";
import { type SinonStubbedFunction, stub } from "sinon";
import {
  Converter,
  type IConverterConvertOptions,
  type IConverterConvertOptionsParsed,
} from "../src/converter.js";
import type { IProvider } from "../src/provider.js";

describe("[convert-svg-core] converter -> Converter", () => {
  let browser: Partial<Browser>;
  let browserClose: SinonStubbedFunction<Browser["close"]>;
  let browserCreateBrowserContext: SinonStubbedFunction<
    Browser["createBrowserContext"]
  >;
  let browserDisconnect: SinonStubbedFunction<Browser["disconnect"]>;
  let browserContext: Partial<BrowserContext>;
  let browserContextClose: SinonStubbedFunction<BrowserContext["close"]>;
  let converter: Converter<
    IConverterConvertOptions,
    IConverterConvertOptionsParsed
  >;
  let provider: IProvider<
    IConverterConvertOptions,
    IConverterConvertOptionsParsed
  >;

  beforeEach(() => {
    browserClose = stub();
    browserCreateBrowserContext = stub();
    browserDisconnect = stub();
    browserContextClose = stub();

    browser = {
      connected: true,
      close: browserClose,
      createBrowserContext: browserCreateBrowserContext,
      disconnect: browserDisconnect,
    };
    browserContext = {
      close: browserContextClose,
    };

    browserClose.resolves();
    browserCreateBrowserContext.resolves(browserContext as BrowserContext);
    browserDisconnect.resolves();
    browserContextClose.resolves();

    provider = {} as IProvider<
      IConverterConvertOptions,
      IConverterConvertOptionsParsed
    >;
  });

  describe("#close", () => {
    it("should close the converter and browser by default", async () => {
      converter = await Converter.create({
        provider,
        browser: browser as Browser,
      });

      assert.equal(converter.closed, false);

      await converter.close();

      assert.ok(browserClose.calledOnce);
      assert.ok(browserDisconnect.notCalled);
      assert.ok(browserContextClose.notCalled);

      assert.equal(converter.closed, true);
    });

    describe("when closeBehavior is 'close'", () => {
      it("should close the converter and browser", async () => {
        converter = await Converter.create({
          provider,
          browser: browser as Browser,
          closeBehavior: "close",
        });

        assert.equal(converter.closed, false);

        await converter.close();

        assert.ok(browserClose.calledOnce);
        assert.ok(browserDisconnect.notCalled);
        assert.ok(browserContextClose.notCalled);

        assert.equal(converter.closed, true);
      });
    });

    describe("when closeBehavior is 'disconnect'", () => {
      it("should close the converter and close browser context and disconnect from browser", async () => {
        converter = await Converter.create({
          provider,
          browser: browser as Browser,
          closeBehavior: "disconnect",
        });

        assert.equal(converter.closed, false);

        await converter.close();

        assert.ok(browserDisconnect.calledOnce);
        assert.ok(browserContextClose.calledOnce);
        assert.ok(browserClose.notCalled);

        assert.equal(converter.closed, true);
      });
    });

    describe("when closeBehavior is 'none'", () => {
      it("should close the converter and only close browser context", async () => {
        converter = await Converter.create({
          provider,
          browser: browser as Browser,
          closeBehavior: "none",
        });

        assert.equal(converter.closed, false);

        await converter.close();

        assert.ok(browserContextClose.calledOnce);
        assert.ok(browserClose.notCalled);
        assert.ok(browserDisconnect.notCalled);

        assert.equal(converter.closed, true);
      });
    });
  });

  describe("#convert", () => {
    // Primarily covered by convert-svg-core-test

    beforeEach(async () => {
      converter = await Converter.create({
        provider,
        browser: browser as Browser,
      });
    });

    describe("when closed", () => {
      it("should thrown an error", async () => {
        await converter.close();

        await assert.rejects(converter.convert("<svg></svg>"), {
          message: "Converter has been closed. A new Converter must be created",
        });
      });
    });
  });

  describe("#convertFile", () => {
    // Primarily covered by convert-svg-core-test

    beforeEach(async () => {
      converter = await Converter.create({
        provider,
        browser: browser as Browser,
      });
    });

    describe("when closed", () => {
      it("should thrown an error", async () => {
        await converter.close();

        await assert.rejects(converter.convertFile("foo.svg"), {
          message: "Converter has been closed. A new Converter must be created",
        });
      });
    });
  });

  describe("#closed", () => {
    beforeEach(async () => {
      converter = await Converter.create({
        provider,
        browser: browser as Browser,
      });
    });

    it("should indicate whether converter has been closed", async () => {
      assert.equal(converter.closed, false);

      await converter.close();

      assert.equal(converter.closed, true);
    });
  });

  describe("#provider", () => {
    beforeEach(async () => {
      converter = await Converter.create({
        provider,
        browser: browser as Browser,
      });
    });

    it("should return provider", () => {
      assert.strictEqual(converter.provider, provider);
    });
  });
});
