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
const fs = require('fs');
const path = require('path');
const util = require('util');

chai.use(chaiAsPromised);

const { expect } = chai;
const readFile = util.promisify(fs.readFile);

const Converter = require('../src/converter');
const { createTests } = require('./helper');

describe('Converter', () => {
  let converter;

  describe('#convert', () => {
    before(() => {
      converter = new Converter();
    });

    after(async() => {
      await converter.destroy();
    });

    createTests(() => converter.convert.bind(converter), 200);

    context('when source is a string', function() {
      /* eslint-disable no-invalid-this */
      this.slow(200);
      /* eslint-enable no-invalid-this */

      let sourceFilePath;
      let source;
      let expectedFilePath;
      let expected;

      before(async() => {
        sourceFilePath = path.resolve(__dirname, 'fixtures', 'source', 'width-height-only.svg');
        source = await readFile(sourceFilePath, 'utf8');
        expectedFilePath = path.resolve(__dirname, 'fixtures', 'expected', '0.png');
        expected = await readFile(expectedFilePath);
      });

      it('should work', async() => {
        const actual = await converter.convert(source);

        expect(actual).to.deep.equal(expected, 'Must match PNG buffer');
      });
    });

    context('when destroyed', () => {
      it('should thrown an error', async() => {
        await converter.destroy();

        await expect(converter.convert('<svg></svg>')).to.eventually.be.rejectedWith(Error,
          'Converter has been destroyed. A new Converter must be created');
      });
    });
  });

  describe('#destroy', () => {
    beforeEach(() => {
      converter = new Converter();
    });

    afterEach(async() => {
      await converter.destroy();
    });

    it('should destroy the Converter', async() => {
      expect(converter.destroyed).to.equal(false, 'Must not be destroyed initially');

      await converter.destroy();

      expect(converter.destroyed).to.equal(true, 'Must be destroyed');
    });
  });
});
