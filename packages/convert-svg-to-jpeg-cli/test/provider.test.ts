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
import { before, beforeEach, describe, it } from "node:test";
import type { Command } from "commander";
import { JpegProvider } from "convert-svg-to-jpeg";
import { type SinonStubbedFunction, stub } from "sinon";
import { JpegCommandProvider } from "../src/provider.js";

describe("[convert-svg-to-jpeg-cli] provider -> JpegCommandProvider", () => {
  let provider: JpegCommandProvider;

  before(() => {
    provider = new JpegCommandProvider();
  });

  it("should extend JpegProvider", () => {
    assert.ok(provider instanceof JpegProvider);
  });

  describe("#parseCommandOptions", () => {
    let command: Command;
    let commandOpts: SinonStubbedFunction<Command["opts"]>;

    beforeEach(() => {
      commandOpts = stub();

      command = {
        opts: commandOpts,
      } as Partial<Command> as Command;
    });

    describe("when quality option is missing", () => {
      it("should return an undefined quality option", () => {
        commandOpts.returns({});

        const options = provider.parseCommandOptions(command, {});

        assert.deepEqual(options, { quality: undefined });
      });
    });

    describe("when quality option is present", () => {
      it("should return quality option", () => {
        commandOpts.returns({ quality: 50 });

        const options = provider.parseCommandOptions(command, {});

        assert.deepEqual(options, { quality: 50 });
      });
    });
  });

  describe("#commandOptions", () => {
    it("should be expected command options", () => {
      assert.deepEqual(provider.commandOptions, [
        {
          flags: "--quality <value>",
          description: "specify quality for JPEG [100]",
          transformer: parseInt,
        },
      ]);
      assert.notStrictEqual(provider.commandOptions, provider.commandOptions);
    });
  });
});
