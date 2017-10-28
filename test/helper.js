/*
 * Copyright (C) 2017 Alasdair Mercer, !ninja
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

'use strict';

const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const fileUrl = require('file-url');
const fs = require('fs');
const path = require('path');
const util = require('util');

chai.use(chaiAsPromised);

const { expect } = chai;
const mkdir = util.promisify(fs.mkdir);
const readFile = util.promisify(fs.readFile);
const writeFile = util.promisify(fs.writeFile);

const { convert } = require('../src/index');
const tests = require('./tests.json');

/**
 * Generates files within the <code>test/fixtures/actual/</code> directory for each test within
 * <code>test/tests.json</code>.
 *
 * This method can be extremely useful for generating expected files for new fixtures, updating existing ones after
 * subtle changes/improvements within Chromium, and primarily to debug tests failing due to missmatched buffers since a
 * visual comparison is more likely to help than comparing bytes.
 *
 * Error tests are ignored as they have no expected output.
 *
 * An error will occur if any problem arises while trying to read/write any files or convert the SVG into a PNG.
 *
 * @return {Promise.<void, Error>} A <code>Promise</code> for the asynchronous file reading and writing as well as
 * SVG-PNG conversion that is resolved once all files have been generated.
 * @public
 */
async function createFixtures() {
  /* eslint-disable no-await-in-loop */
  let index = -1;

  for (const test of tests) {
    index++;

    if (test.error) {
      continue;
    }

    const sourceFilePath = path.resolve(__dirname, 'fixtures', 'source', test.file);
    const source = await readFile(sourceFilePath);
    const options = parseOptions(test, sourceFilePath);

    const actualFilePath = path.resolve(__dirname, 'fixtures', 'actual', `${index}.png`);
    const actual = await convert(source, options);

    try {
      await mkdir(path.dirname(actualFilePath));
    } catch (e) {
      if (e.code !== 'EEXIST') {
        throw e;
      }
    }

    await writeFile(actualFilePath, actual);
  }
  /* eslint-enable no-await-in-loop */
}

/**
 * Describes each test within <code>test/tests.json</code>.
 *
 * @param {Function} methodSupplier - a function that returns the convert method to be tested
 * @param {number} slow - the number of milliseconds to be considered "slow"
 * @return {void}
 * @public
 */
function createTests(methodSupplier, slow) {
  tests.forEach((test, index) => {
    context(`(test:${index}) ${test.name}`, function() {
      /* eslint-disable no-invalid-this */
      this.slow(slow);
      /* eslint-enable no-invalid-this */

      const message = test.error ? 'should throw an error' : test.message;

      let sourceFilePath;
      let source;
      let options;
      let expectedFilePath;
      let expected;

      before(async() => {
        sourceFilePath = path.resolve(__dirname, 'fixtures', 'source', test.file);
        source = await readFile(sourceFilePath);
        options = parseOptions(test, sourceFilePath);

        if (!test.error) {
          expectedFilePath = path.resolve(__dirname, 'fixtures', 'expected', `${index}.png`);
          expected = await readFile(expectedFilePath);
        }
      });

      it(message, async() => {
        const method = methodSupplier();

        if (test.error) {
          await expect(method(source, options)).to.eventually.be.rejectedWith(Error, test.error);
        } else {
          const actual = await method(source, options);

          expect(actual).to.deep.equal(expected, 'Must match PNG buffer');
        }
      });
    });
  });
}

/**
 * Parses the options for the specified <code>test</code> using the <code>filePath</code> provided, where appropriate.
 *
 * @param {Object} test - the test whose options are to be parsed
 * @param {string} filePath - the path of the file to be used to populate the <code>baseFile</code> and/or
 * <code>baseUrl</code> options, if needed
 * @return {Object} The parsed options for <code>test</code>.
 * @private
 */
function parseOptions(test, filePath) {
  const options = Object.assign({}, test.options);

  if (test.includeFile) {
    options.baseFile = filePath;
  }
  if (test.includeUrl) {
    options.baseUrl = fileUrl(filePath);
  }

  return options;
}

module.exports = { createFixtures, createTests };
