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
import {
  WebpProvider,
  type WebpProviderConvertOptionsParsed,
} from "../src/provider.js";

describe("[convert-svg-to-webp] provider -> WebpProvider", () => {
  let provider: WebpProvider;

  before(() => {
    provider = new WebpProvider();
  });

  describe("#getBackgroundColor", () => {
    describe("when background option was not specified", () => {
      it("should return transparent", () => {
        assert.equal(
          provider.getBackgroundColor({} as WebpProviderConvertOptionsParsed),
          "transparent",
        );
      });
    });

    describe("when background option was specified", () => {
      it("should return background", () => {
        assert.equal(
          provider.getBackgroundColor({
            background: "#000",
          } as WebpProviderConvertOptionsParsed),
          "#000",
        );
      });
    });
  });

  describe("#getScreenshotOptions", () => {
    it("should return puppeteer screenshot options with quality option", () => {
      assert.deepEqual(
        provider.getScreenshotOptions({
          quality: 50,
        } as WebpProviderConvertOptionsParsed),
        {
          quality: 50,
        },
      );
    });
  });

  describe("#parseConverterOptions", () => {
    describe("when quality option is missing", () => {
      it("should return quality option default value", () => {
        const options = provider.parseConverterOptions(
          {},
          {} as IConverterConvertOptionsParsed,
        );

        assert.deepEqual(options, { quality: 100 });
      });
    });

    describe("when quality option is valid", () => {
      it("should return valid quality option", () => {
        [0, 50, 100].forEach((quality) => {
          const options = provider.parseConverterOptions(
            { quality },
            {} as IConverterConvertOptionsParsed,
          );

          assert.deepEqual(options, { quality });
        });
      });
    });

    describe("when quality option is out of range", () => {
      it("should throw an error", () => {
        [-1, 101].forEach((quality) => {
          assert.throws(
            () => {
              provider.parseConverterOptions(
                { quality },
                {} as IConverterConvertOptionsParsed,
              );
            },
            (error) => {
              return (
                error instanceof Error &&
                error.message ===
                  "Value for quality option out of range. Use value between 0-100 (inclusive)"
              );
            },
          );
        });
      });
    });
  });

  describe("#extension", () => {
    it("should be the expected output file extension", () => {
      assert.equal(provider.extension, "webp");
    });
  });

  describe("#format", () => {
    it("should be the expected output format", () => {
      assert.equal(provider.format, "webp");
    });
  });
});
