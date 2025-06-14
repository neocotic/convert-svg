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

import assert from "node:assert";
import { describe, it } from "node:test";
import { Browser, BrowserContext } from "puppeteer-core";
import { type SinonStubbedFunction, stub } from "sinon";
import * as index from "../src/index.js";
import { JpegProvider } from "../src/provider.js";

describe("[convert-svg-to-jpeg] index -> JpegProvider", () => {
  it("should be a reference to JpegProvider constructor", () => {
    assert.strictEqual(
      index.JpegProvider,
      JpegProvider,
      "Must be JpegProvider constructor",
    );
  });
});

describe("[convert-svg-to-jpeg] index -> convert", () => {
  it("should be a function", () => {
    assert.equal(typeof index.convert, "function");
  });
});

describe("[convert-svg-to-jpeg] index -> convertFile", () => {
  it("should be a function", () => {
    assert.equal(typeof index.convertFile, "function");
  });
});

describe("[convert-svg-to-jpeg] index -> createConverter", () => {
  it("should be a function", () => {
    assert.equal(typeof index.createConverter, "function");
  });

  it("should be configured to use JpegProvider", async () => {
    const browserCreateBrowserContext: SinonStubbedFunction<
      Browser["createBrowserContext"]
    > = stub();
    const browser = {
      connected: true,
      createBrowserContext: browserCreateBrowserContext,
    } as Partial<Browser> as Browser;

    browserCreateBrowserContext.resolves({} as BrowserContext);

    const converter = await index.createConverter({ browser });

    assert.ok(converter.provider instanceof JpegProvider);
  });
});
