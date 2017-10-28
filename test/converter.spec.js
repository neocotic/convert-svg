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
const sinon = require('sinon');
const util = require('util');

chai.use(chaiAsPromised);

const { expect } = chai;
const readFile = util.promisify(fs.readFile);

const Converter = require('../src/converter');
const { createConvertFileTests, createConvertTests } = require('./helper');
const pkg = require('../package.json');

describe('Converter', () => {
  let converter;

  describe('.convert', () => {
    beforeEach(() => {
      converter = new Converter();

      sinon.spy(converter, 'destroy');
      sinon.stub(Converter, 'createConverter').returns(converter);
    });

    afterEach(() => {
      expect(Converter.createConverter.callCount).to.equal(1, 'Converter.createConverter must be called');
      expect(converter.destroy.callCount).to.equal(1, 'Converter#destroy must be called');

      Converter.createConverter.restore();
    });

    createConvertTests(() => Converter.convert, 350);
  });

  describe('.convertFile', () => {
    beforeEach(() => {
      converter = new Converter();

      sinon.spy(converter, 'destroy');
      sinon.stub(Converter, 'createConverter').returns(converter);
    });

    afterEach(() => {
      expect(Converter.createConverter.callCount).to.equal(1, 'Converter.createConverter must be called');
      expect(converter.destroy.callCount).to.equal(1, 'Converter#destroy must be called');

      Converter.createConverter.restore();
    });

    createConvertFileTests(() => Converter.convertFile, 400);
  });

  describe('.createConverter', () => {
    it('should return Converter instance', () => {
      expect(Converter.createConverter()).to.be.an.instanceOf(Converter, 'Must return a Converter');
    });

    it('should never return same instance', () => {
      expect(Converter.createConverter()).to.not.equal(Converter.createConverter(), 'Must return unique instances');
    });
  });

  describe('.VERSION', () => {
    it('should match version in package.json', () => {
      expect(Converter.VERSION).to.equal(pkg.version, 'Must match package version');
    });
  });

  describe('#convert', () => {
    before(() => {
      converter = new Converter();
    });

    after(async() => {
      await converter.destroy();
    });

    createConvertTests(() => converter.convert.bind(converter), 200);

    context('when input is a string', function() {
      /* eslint-disable no-invalid-this */
      this.slow(200);
      /* eslint-enable no-invalid-this */

      let inputFilePath;
      let input;
      let expectedFilePath;
      let expected;

      before(async() => {
        inputFilePath = path.resolve(__dirname, 'fixtures', 'input', 'width-height-only.svg');
        input = await readFile(inputFilePath, 'utf8');
        expectedFilePath = path.resolve(__dirname, 'fixtures', 'expected', '0.png');
        expected = await readFile(expectedFilePath);
      });

      it('should convert SVG string to PNG buffer', async() => {
        const actual = await converter.convert(input);

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

  describe('#convertFile', () => {
    before(() => {
      converter = new Converter();
    });

    after(async() => {
      await converter.destroy();
    });

    createConvertFileTests(() => converter.convertFile.bind(converter), 250);

    context('when destroyed', () => {
      it('should thrown an error', async() => {
        await converter.destroy();

        await expect(converter.convertFile('<svg></svg>')).to.eventually.be.rejectedWith(Error,
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
