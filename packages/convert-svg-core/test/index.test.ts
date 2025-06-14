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
import { describe, it } from "node:test";
import { Converter } from "../src/converter.js";
import { defineFunctions } from "../src/function.js";
import * as index from "../src/index.js";

describe("[convert-svg-core] index -> Converter", () => {
  it("should be a reference to Converter constructor", () => {
    assert.strictEqual(
      index.Converter,
      Converter,
      "Must be Converter constructor",
    );
  });
});

describe("[convert-svg-core] index -> defineFunctions", () => {
  it("should be a reference to defineFunctions function", () => {
    assert.strictEqual(
      index.defineFunctions,
      defineFunctions,
      "Must be defineFunctions function",
    );
  });
});
