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

import { z } from "zod";

const TestAssertionSchema = z.record(z.string(), z.unknown());

/**
 * A schema that can be used to parse and validate a {@link TestRunnerEnvOptions}.
 */
export const TestRunnerEnvOptionsSchema = z.strictObject({
  assertion: TestAssertionSchema.optional(),
  preGenerateOutputFiles: z.boolean().optional(),
  retainOutputFiles: z.boolean().optional(),
});

/**
 * A schema that can be used to parse and validate an {@link ITest}.
 */
export const TestSchema = z.strictObject({
  assertion: TestAssertionSchema.optional(),
  core: z.boolean().optional(),
  error: z.string().optional(),
  file: z.string().nonempty().endsWith(".svg"),
  includeBaseFile: z.boolean().optional(),
  includeBaseUrl: z.boolean().optional(),
  message: z.string().nonempty().optional(),
  name: z.string().nonempty(),
  only: z.boolean().optional(),
  options: z.record(z.string(), z.unknown()).optional(),
  skip: z.boolean().optional(),
});
