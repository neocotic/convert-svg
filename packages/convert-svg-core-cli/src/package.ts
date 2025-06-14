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

import { resolve } from "node:path";
import { readPackageUp } from "read-package-up";

/**
 * Contains information relating to a package.
 */
export interface IPackage {
  /**
   * The package name.
   */
  readonly name: string;
  /**
   * The package version.
   */
  readonly version: string;
}

/**
 * Supplies information relating to a package.
 */
export interface IPackageSupplier {
  /**
   * Returns an {@link IPackage}.
   *
   * An error will occur if unable to supply a {@link IPackage}.
   *
   * @return The package information.
   */
  (): Promise<IPackage>;
}

/**
 * Returns an {@link IPackageSupplier} that discovers the closest `package.json` file to the parent of the specified
 * `dirname`.
 *
 * It must start its discovery from the parent of `dirname` instead of `dirname` itself as `tshy` generates incomplete
 * `package.json` files in `dist` subdirectories, which would be incorrectly discovered and cause problems.
 *
 * The returned supplier will throw an error if unable to discover a `package.json` file.
 *
 * @param dirname The directory to start the discovery from.
 * @return An {@link IPackageSupplier} that discovers the closest legitimate `package.json` file to `dirname`.
 */
export const discoveryPackageSupplier = (dirname: string): IPackageSupplier => {
  let pkg: IPackage | undefined;

  return async () => {
    if (!pkg) {
      const result = await readPackageUp({ cwd: resolve(dirname, "../") });
      if (!result) {
        throw new Error(
          `Failed to discover package.json parent from directory: ${dirname}`,
        );
      }

      pkg = {
        name: result.packageJson.name,
        version: result.packageJson.version,
      };
    }

    return { ...pkg };
  };
};

/**
 * Returns an {@link IPackageSupplier} that always returns the specified `pkg`.
 *
 * @param pkg The fixed {@link IPackage} to always be supplied.
 * @return An {@link IPackageSupplier} that always returns `pkg`.
 */
export const fixedPackageSupplier = (pkg: IPackage): IPackageSupplier => {
  return async () => ({ ...pkg });
};
