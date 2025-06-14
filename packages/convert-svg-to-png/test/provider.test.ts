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
import { before, describe, it } from "node:test";
import type { IConverterConvertOptionsParsed } from "convert-svg-core";
import { PngProvider } from "../src/provider.js";

describe("[convert-svg-to-png] provider -> PngProvider", () => {
  let provider: PngProvider;

  before(() => {
    provider = new PngProvider();
  });

  describe("#getBackgroundColor", () => {
    describe("when background option was not specified", () => {
      it("should return transparent color", () => {
        assert.equal(
          provider.getBackgroundColor({} as IConverterConvertOptionsParsed),
          "transparent",
        );
      });
    });

    describe("when background option was specified", () => {
      it("should return background", () => {
        assert.equal(
          provider.getBackgroundColor({
            background: "#000",
          } as IConverterConvertOptionsParsed),
          "#000",
        );
      });
    });
  });

  describe("#getScreenshotOptions", () => {
    describe("when background option was not specified", () => {
      it("should return puppeteer screenshot options with background omitted", () => {
        assert.deepEqual(
          provider.getScreenshotOptions({} as IConverterConvertOptionsParsed),
          {
            omitBackground: true,
          },
        );
      });
    });

    describe("when background option was specified", () => {
      it("should return puppeteer screenshot options with background", () => {
        assert.deepEqual(
          provider.getScreenshotOptions({
            background: "#000",
          } as IConverterConvertOptionsParsed),
          { omitBackground: false },
        );
      });
    });
  });

  describe("#parseConverterOptions", () => {
    it("should return parsedOptions", () => {
      const parsedOptions = {} as IConverterConvertOptionsParsed;

      const options = provider.parseConverterOptions({}, parsedOptions);

      assert.strictEqual(options, parsedOptions);
    });
  });

  describe("#extension", () => {
    it("should be the expected output file extension", () => {
      assert.equal(provider.extension, "png");
    });
  });

  describe("#format", () => {
    it("should be the expected output format", () => {
      assert.equal(provider.format, "png");
    });
  });
});
