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
const JPEGProvider = require('../src/JPEGProvider');

describe('[convert-svg-to-jpeg] JPEGProvider', () => {
  let provider;

  before(() => {
    provider = new JPEGProvider();
  });

  it('should extend Provider', () => {
    expect(provider).to.be.an.instanceOf(Provider);
  });

  describe('#getBackgroundColor', () => {
    it('should return white color', () => {
      expect(provider.getBackgroundColor()).to.equal('#FFF');
    });
  });

  describe('#getCLIOptions', () => {
    it('should return CLI options', () => {
      expect(provider.getCLIOptions()).to.deep.equal([
        {
          flags: '--quality <value>',
          description: 'specify quality for JPEG [100]',
          parseInt
        }
      ]);
    });
  });

  describe('#getExtension', () => {
    it('should return output file extension', () => {
      expect(provider.getExtension()).to.equal('jpeg');
    });
  });

  describe('#getFormat', () => {
    it('should return output format', () => {
      expect(provider.getFormat()).to.equal('JPEG');
    });
  });

  describe('#getScreenshotOptions', () => {
    context('when quality option was not specified', () => {
      it('should return puppeteer screenshot options excluding quality', () => {
        expect(provider.getScreenshotOptions({})).to.deep.equal({});
      });
    });
    context('when quality option was specified', () => {
      it('should return puppeteer screenshot options including quality', () => {
        expect(provider.getScreenshotOptions({ quality: 50 })).to.deep.equal({ quality: 50 });
      });
    });
  });

  describe('#getType', () => {
    it('should return output type supported as supported by puppeteer screenshots', () => {
      expect(provider.getType()).to.equal('jpeg');
    });
  });

  describe('#getVersion', () => {
    it('should return version in package.json', () => {
      expect(provider.getVersion()).to.equal(pkg.version);
    });
  });

  describe('#parseAPIOptions', () => {
    context('when quality option is missing', () => {
      it('should do nothing', () => {
        const options = {};

        provider.parseAPIOptions(options);

        expect(options).to.deep.equal({});
      });
    });

    context('when quality option is valid', () => {
      it('should do nothing', () => {
        const options = { quality: 0 };

        provider.parseAPIOptions(options);

        expect(options).to.deep.equal({ quality: 0 });

        options.quality = 50;

        provider.parseAPIOptions(options);

        expect(options).to.deep.equal({ quality: 50 });

        options.quality = 100;

        provider.parseAPIOptions(options);

        expect(options).to.deep.equal({ quality: 100 });
      });
    });

    context('when quality option is out of range', () => {
      it('should throw an error', () => {
        expect(() => provider.parseAPIOptions({ quality: -1 })).to.throw(Error,
          'Value for quality option out of range. Use value between 0-100 (inclusive)');
        expect(() => provider.parseAPIOptions({ quality: 101 })).to.throw(Error,
          'Value for quality option out of range. Use value between 0-100 (inclusive)');
      });
    });
  });

  describe('#parseCLIOptions', () => {
    it('should extract quality CLI option', () => {
      const options = {};

      provider.parseCLIOptions(options, {});

      expect(options.quality).to.be.undefined;

      provider.parseCLIOptions(options, { quality: 50 });

      expect(options.quality).to.equal(50);
    });
  });
});
