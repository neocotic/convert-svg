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
import { EOL } from "node:os";
import { dirname } from "node:path";
import { Writable } from "node:stream";
import { afterEach, beforeEach, describe, it } from "node:test";
import { fileURLToPath } from "node:url";
import type {
  IConverterConvertOptions,
  IConverterConvertOptionsParsed,
} from "convert-svg-core";
import {
  type SinonStubbedFunction,
  type SinonStubbedInstance,
  createStubInstance,
  stub,
} from "sinon";
import { Controller } from "../src/controller.js";
import type { ICommandProvider } from "../src/provider.js";

describe("[convert-svg-core-cli] controller -> Controller", () => {
  let controller: Controller<
    IConverterConvertOptions,
    IConverterConvertOptionsParsed
  >;
  let errorStream: SinonStubbedInstance<Writable>;
  let outputStream: SinonStubbedInstance<Writable>;
  let provider: Partial<
    ICommandProvider<IConverterConvertOptions, IConverterConvertOptionsParsed>
  >;

  beforeEach(async () => {
    errorStream = createStubInstance(Writable);
    outputStream = createStubInstance(Writable);

    provider = {
      commandOptions: [],
      format: "png",
    };

    controller = await Controller.create({
      baseDir: dirname(fileURLToPath(import.meta.url)),
      errorStream,
      outputStream,
      package: stub().resolves({
        name: "convert-svg-core-cli",
        version: "0.0.0",
      }),
      provider: provider as ICommandProvider<
        IConverterConvertOptions,
        IConverterConvertOptionsParsed
      >,
    });
  });

  describe("#error", () => {
    it("should write message to error stream", () => {
      controller.error("bad");

      assert.equal(outputStream.write.callCount, 0);
      assert.equal(errorStream.write.callCount, 1);
      assert.deepEqual(errorStream.write.args, [[`bad${EOL}`]]);
    });
  });

  describe("#fail", () => {
    let processExit: SinonStubbedFunction<typeof process.exit>;

    beforeEach(() => {
      processExit = stub(process, "exit");
    });

    afterEach(() => {
      processExit.restore();
    });

    it("should write message containing stringified error if not an Error", () => {
      const error = "bad";

      controller.fail(error);

      assert.equal(outputStream.write.callCount, 0);
      assert.equal(errorStream.write.callCount, 1);
      assert.deepEqual(errorStream.write.args, [
        [`convert-svg-core-cli failed: bad${EOL}`],
      ]);

      assert.equal(processExit.callCount, 1);
      assert.deepEqual(processExit.args, [[1]]);
    });

    it("should write message containing error.message if available", () => {
      const error = { message: "bad" };

      controller.fail(error);

      assert.equal(outputStream.write.callCount, 0);
      assert.equal(errorStream.write.callCount, 1);
      assert.deepEqual(errorStream.write.args, [
        [`convert-svg-core-cli failed: bad${EOL}`],
      ]);

      assert.equal(processExit.callCount, 1);
      assert.deepEqual(processExit.args, [[1]]);
    });

    it("should write message containing error.stack if available", () => {
      const error = new Error("bad");

      controller.fail(error);

      assert.equal(outputStream.write.callCount, 0);
      assert.equal(errorStream.write.callCount, 1);
      assert.deepEqual(errorStream.write.args, [
        [`convert-svg-core-cli failed: ${error.stack}${EOL}`],
      ]);

      assert.equal(processExit.callCount, 1);
      assert.deepEqual(processExit.args, [[1]]);
    });
  });

  describe("#output", () => {
    it("should write message to output stream", () => {
      controller.output("good");

      assert.equal(errorStream.write.callCount, 0);
      assert.equal(outputStream.write.callCount, 1);
      assert.deepEqual(outputStream.write.args, [[`good${EOL}`]]);
    });
  });

  describe("#parse", () => {
    // TODO: Test all CLI flows and options
  });

  describe("#provider", () => {
    it("should return provider", () => {
      assert.strictEqual(controller.provider, provider);
    });
  });
});
