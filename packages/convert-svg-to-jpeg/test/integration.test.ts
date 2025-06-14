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

import test from "node:test";
import { TestRunner } from "convert-svg-core-test";
import { JpegProvider } from "../src/provider.js";
import tests from "./tests.json" with { type: "json" };

test("[convert-svg-to-jpeg] integration", (t) => {
  const runner = new TestRunner({
    baseDir: import.meta.dirname,
    provider: new JpegProvider(),
    tests,
    /*
     * Uncomment the lines below to convert all test input files and write their outputs to the "fixtures/actual"
     * directory before the test suite is run.
     *
     * The following options can be extremely useful for creating expected files for new tests, updating existing ones
     * after changes/improvements within Chromium, and primarily to debug tests failing due to mismatching images.
     *
     * Remember to comment this out again before committing.
     */
    // preGenerateOutputFiles: true,
    // retainOutputFiles: true,
  });

  return runner.describeConverter(t);
});
