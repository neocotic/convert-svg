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
const { Provider } = require('convert-svg-core');

const pkg = require('../package.json');
const PNGProvider = require('../src/PNGProvider');

describe('[convert-svg-to-png] PNGProvider', () => {
  let provider;

  before(() => {
    provider = new PNGProvider();
  });

  it('should extend Provider', () => {
    expect(provider).to.be.an.instanceOf(Provider);
  });

  describe('#getBackgroundColor', () => {
    it('should return transparent color', () => {
      expect(provider.getBackgroundColor()).to.equal('transparent');
    });
  });

  describe('#getCLIOptions', () => {
    it('should return null', () => {
      expect(provider.getCLIOptions()).to.be.null;
    });
  });

  describe('#getExtension', () => {
    it('should return output file extension', () => {
      expect(provider.getExtension()).to.equal('png');
    });
  });

  describe('#getFormat', () => {
    it('should return output format', () => {
      expect(provider.getFormat()).to.equal('PNG');
    });
  });

  describe('#getScreenshotOptions', () => {
    it('should return puppeteer screenshot options with background omitted', () => {
      expect(provider.getScreenshotOptions()).to.deep.equal({ omitBackground: true });
    });
  });

  describe('#getType', () => {
    it('should return output type supported as supported by puppeteer screenshots', () => {
      expect(provider.getType()).to.equal('png');
    });
  });

  describe('#getVersion', () => {
    it('should return version in package.json', () => {
      expect(provider.getVersion()).to.equal(pkg.version);
    });
  });

  describe('#parseAPIOptions', () => {
    it('should do nothing', () => {
      const options = {};

      provider.parseAPIOptions(options);

      expect(options).to.deep.equal({});
    });
  });

  describe('#parseCLIOptions', () => {
    it('should do nothing', () => {
      const options = {};

      provider.parseCLIOptions(options);

      expect(options).to.deep.equal({});
    });
  });
});
