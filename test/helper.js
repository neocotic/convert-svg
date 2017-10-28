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
const rimraf = require('rimraf');
const util = require('util');

chai.use(chaiAsPromised);

const { expect } = chai;
const makeDirectory = util.promisify(fs.mkdir);
const readFile = util.promisify(fs.readFile);
const removeFile = util.promisify(rimraf);
const writeFile = util.promisify(fs.writeFile);

const { convert } = require('../src/index');
const tests = require('./tests.json');

/**
 * Describes each test within <code>test/tests.json</code> for the <code>convertFile</code> method.
 *
 * @param {Function} methodSupplier - a function that returns the <code>convertFile</code> method to be tested
 * @param {number} slow - the number of milliseconds to be considered "slow"
 * @return {void}
 * @public
 */
function createConvertFileTests(methodSupplier, slow) {
  before(async() => {
    try {
      await makeDirectory(path.resolve(__dirname, 'fixtures', 'actual'));
    } catch (e) {
      if (e.code !== 'EEXIST') {
        throw e;
      }
    }
  });

  after(async() => {
    await removeFile(path.resolve(__dirname, 'fixtures', 'actual'), { glob: false });
  });

  tests.forEach((test, index) => {
    context(`(test:${index}) ${test.name}`, function() {
      /* eslint-disable no-invalid-this */
      this.slow(slow);
      /* eslint-enable no-invalid-this */

      const message = test.error ? 'should throw an error' : test.message;

      let outputFilePath;
      let inputFilePath;
      let options;
      let expectedFilePath;
      let expected;

      before(async() => {
        outputFilePath = path.resolve(__dirname, 'fixtures', 'actual', `${index}.png`);
        inputFilePath = path.resolve(__dirname, 'fixtures', 'input', test.file);
        options = parseOptions(test, inputFilePath, outputFilePath);

        if (!test.error) {
          expectedFilePath = path.resolve(__dirname, 'fixtures', 'expected', `${index}.png`);
          expected = await readFile(expectedFilePath);
        }
      });

      it(message, async() => {
        const method = methodSupplier();

        if (test.error) {
          await expect(method(inputFilePath, options)).to.eventually.be.rejectedWith(Error, test.error);
        } else {
          const actualFilePath = await method(inputFilePath, options);
          const actual = await readFile(outputFilePath);

          expect(actualFilePath).to.equal(outputFilePath, 'Must match output file path');
          expect(actual).to.deep.equal(expected, 'Must match PNG buffer');
        }
      });
    });
  });
}

/**
 * Describes each test within <code>test/tests.json</code> for the <code>convert</code> method.
 *
 * @param {Function} methodSupplier - a function that returns the <code>convert</code> method to be tested
 * @param {number} slow - the number of milliseconds to be considered "slow"
 * @return {void}
 * @public
 */
function createConvertTests(methodSupplier, slow) {
  tests.forEach((test, index) => {
    context(`(test:${index}) ${test.name}`, function() {
      /* eslint-disable no-invalid-this */
      this.slow(slow);
      /* eslint-enable no-invalid-this */

      const message = test.error ? 'should throw an error' : test.message;

      let inputFilePath;
      let input;
      let options;
      let expectedFilePath;
      let expected;

      before(async() => {
        inputFilePath = path.resolve(__dirname, 'fixtures', 'input', test.file);
        input = await readFile(inputFilePath);
        options = parseOptions(test, inputFilePath);

        if (!test.error) {
          expectedFilePath = path.resolve(__dirname, 'fixtures', 'expected', `${index}.png`);
          expected = await readFile(expectedFilePath);
        }
      });

      it(message, async() => {
        const method = methodSupplier();

        if (test.error) {
          await expect(method(input, options)).to.eventually.be.rejectedWith(Error, test.error);
        } else {
          const actual = await method(input, options);

          expect(actual).to.deep.equal(expected, 'Must match PNG buffer');
        }
      });
    });
  });
}

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
 * @return {Promise.<void, Error>} A <code>Promise</code> that is resolved once all files have been generated.
 * @public
 */
async function createFixtures() {
  let index = -1;

  for (const test of tests) {
    index++;

    if (test.error) {
      continue;
    }

    const inputFilePath = path.resolve(__dirname, 'fixtures', 'input', test.file);
    const input = await readFile(inputFilePath);
    const options = parseOptions(test, inputFilePath);

    const actualFilePath = path.resolve(__dirname, 'fixtures', 'actual', `${index}.png`);
    const actual = await convert(input, options);

    try {
      await makeDirectory(path.dirname(actualFilePath));
    } catch (e) {
      if (e.code !== 'EEXIST') {
        throw e;
      }
    }

    await writeFile(actualFilePath, actual);
  }
}

/**
 * Parses the options for the specified <code>test</code> using the file paths provided, where appropriate.
 *
 * @param {Object} test - the test whose options are to be parsed
 * @param {string} inputFilePath - the path of the file to be used to populate the <code>baseFile</code> and/or
 * <code>baseUrl</code> options, if needed
 * @param {string} [outputFilePath] - the path of the file to be usedt to populate the <code>outputFilePath</code>
 * option
 * @return {Object} The parsed options for <code>test</code>.
 * @private
 */
function parseOptions(test, inputFilePath, outputFilePath) {
  const options = Object.assign({}, test.options);
  if (outputFilePath) {
    options.outputFilePath = outputFilePath;
  }

  if (test.includeFile) {
    options.baseFile = inputFilePath;
  }
  if (test.includeUrl) {
    options.baseUrl = fileUrl(inputFilePath);
  }

  return options;
}

module.exports = {
  createConvertFileTests,
  createConvertTests,
  createFixtures
};
