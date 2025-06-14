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
import { dir as tmpDir } from "tmp";
import coreCliPackage from "../package.json" with { type: "json" };
import {
  type IPackage,
  discoveryPackageSupplier,
  fixedPackageSupplier,
} from "../src/index.js";

describe("[convert-svg-core-cli] package -> discoveryPackageSupplier", () => {
  let tempDirCleanup: () => void;
  let tempDirPath: string;

  beforeEach(async () => {
    await new Promise<void>((resolve, reject) =>
      tmpDir((error, dirPath, cleanup) => {
        if (error) {
          reject(error);
        } else {
          tempDirCleanup = cleanup;
          tempDirPath = dirPath;

          resolve();
        }
      }),
    );
  });

  afterEach(() => {
    tempDirCleanup();
  });

  it("should return a supplier that resolves with package information from closest package.json", async () => {
    const pkg: IPackage = {
      name: coreCliPackage.name,
      version: coreCliPackage.version,
    };

    const supplier = discoveryPackageSupplier(import.meta.dirname);

    const actual = await supplier();

    assert.deepEqual(actual, pkg);
    assert.notStrictEqual(actual, await supplier());
  });

  it("should return a supplier that rejects with an error when no package.json is found", () => {
    const supplier = discoveryPackageSupplier(tempDirPath);

    assert.rejects(supplier, {
      message: `Failed to discover package.json parent from directory: ${tempDirPath}`,
    });
  });
});

describe("[convert-svg-core-cli] package -> fixedPackageSupplier", () => {
  let pkg: IPackage;

  beforeEach(() => {
    pkg = {
      name: "convert-svg-core-cli",
      version: "0.0.0",
    };
  });

  it("should return supplier that always resolves with the same package information", async () => {
    const supplier = fixedPackageSupplier(pkg);

    const actual = await supplier();

    assert.deepEqual(actual, pkg);
    assert.notStrictEqual(actual, await supplier());
  });
});
