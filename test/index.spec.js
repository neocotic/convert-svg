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

const { expect } = require('chai');
const sinon = require('sinon');

const Converter = require('../src/converter');
const { createConvertFileTests, createConvertTests } = require('./helper');
const index = require('../src/index');
const pkg = require('../package.json');

describe('index', () => {
  describe('.convert', () => {
    let converter;

    beforeEach(() => {
      converter = new Converter();

      sinon.spy(converter, 'destroy');
      sinon.stub(index, 'createConverter').returns(converter);
    });

    afterEach(() => {
      expect(index.createConverter.callCount).to.equal(1, 'createConverter must be called');
      expect(converter.destroy.callCount).to.equal(1, 'Converter#destroy must be called');

      index.createConverter.restore();
    });

    createConvertTests(() => index.convert, 350);
  });

  describe('.convertFile', () => {
    let converter;

    beforeEach(() => {
      converter = new Converter();

      sinon.spy(converter, 'destroy');
      sinon.stub(index, 'createConverter').returns(converter);
    });

    afterEach(() => {
      expect(index.createConverter.callCount).to.equal(1, 'createConverter must be called');
      expect(converter.destroy.callCount).to.equal(1, 'Converter#destroy must be called');

      index.createConverter.restore();
    });

    createConvertFileTests(() => index.convertFile, 400);
  });

  describe('.createConverter', () => {
    it('should return Converter instance', () => {
      expect(index.createConverter()).to.be.an.instanceOf(Converter, 'Must return a Converter');
    });

    it('should never return same instance', () => {
      expect(index.createConverter()).to.not.equal(index.createConverter(), 'Must return unique instances');
    });
  });

  describe('.version', () => {
    it('should match version in package.json', () => {
      expect(index.version).to.equal(pkg.version, 'Must match package version');
    });
  });
});
