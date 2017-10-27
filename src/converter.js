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

/* global document: false */

const fileUrl = require('file-url');
const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');
const tmp = require('tmp');
const util = require('util');

const readFile = util.promisify(fs.readFile);
const writeFile = util.promisify(fs.writeFile);

const _browser = Symbol('browser');
const _convert = Symbol('convert');
const _destroyed = Symbol('destroyed');
const _getDimensions = Symbol('getDimensions');
const _getPage = Symbol('getPage');
const _getTempFile = Symbol('getTempFile');
const _page = Symbol('page');
const _parseOptions = Symbol('parseOptions');
const _setDimensions = Symbol('setDimensions');
const _tempFile = Symbol('tempFile');
const _validate = Symbol('validate');

/**
 * Converts SVG to PNG using a headless Chromium instance.
 *
 * It is important to note that, after the first time either {@link Converter#convert} or{@link Converter#convertFile}
 * are called, a headless Chromium instance will remain open until {@link Converter#destroy} is called. This is done
 * automatically when using the main API convert methods, however, when using {@link Converter} directly, it is the
 * responsibility of the caller. Due to the fact that creating browser instances is expensive, this level of control
 * allows callers to reuse a browser for multiple conversions. For example; one could create a {@link Converter} and use
 * it to convert a collection of SVG files to PNG files and then destroy it afterwards. It's not recommended to keep an
 * instance around for too long, as it will use up resources.
 *
 * Due constraints within Chromium, the SVG source is first written to a temporary HTML file and then navigated to. This
 * is because the default page for Chromium is using the <code>chrome</code> protocol so cannot load externally
 * referenced files (e.g. that use the <code>file</code> protocol). This temproary file is reused for the lifespan of
 * each {@link Converter} instance and will be deleted when it is destroyed.
 *
 * It's also the responsibility of the caller to ensure that all {@link Converter} instances are destroyed before the
 * process exits. This is why a short-lived {@link Converter} instance combined with a try/finally block is ideal.
 *
 * @public
 */
class Converter {

  static [_parseOptions](options, sourceFilePath) {
    options = Object.assign({}, options);

    if (!options.targetFilePath && sourceFilePath) {
      const targetDirPath = path.dirname(sourceFilePath);
      const targetFileName = `${path.basename(sourceFilePath, path.extname(sourceFilePath))}.png`;

      options.targetFilePath = path.join(targetDirPath, targetFileName);
    }

    if (typeof options.baseFile === 'string') {
      options.baseUrl = fileUrl(options.baseFile);
      delete options.baseFile;
    }
    if (!options.baseUrl) {
      options.baseUrl = fileUrl(sourceFilePath ? path.resolve(sourceFilePath) : process.cwd());
    }

    if (typeof options.height === 'string') {
      options.height = parseInt(options.height, 10);
    }
    if (typeof options.width === 'string') {
      options.width = parseInt(options.width, 10);
    }

    return options;
  }

  /**
   * Creates an instance of {@link Converter}.
   *
   * @public
   */
  constructor() {
    this[_destroyed] = false;
  }

  /**
   * Converts the specified <code>source</code> SVG into a PNG using the <code>options</code> provided.
   *
   * <code>source</code> can either be a SVG buffer or string.
   *
   * If the width and/or height cannot be derived from <code>source</code> then they must be provided via their
   * corresponding options. This method attempts to derive the dimensions from <code>source</code> via any
   * <code>width</code>/<code>height</code> attributes or its calculated <code>viewBox</code> attribute.
   *
   * This method is resolved with the PNG buffer.
   *
   * An error will occur if this {@link Converter} has been destroyed, <code>source</code> does not contain an SVG
   * element, or no <code>width</code> and/or <code>height</code> options were provided and this information could not
   * be derived from <code>source</code>.
   *
   * @param {Buffer|string} source - the SVG source to be converted to a PNG
   * @param {Converter~ConvertOptions} [options] - the options to be used
   * @return {Promise.<Buffer, Error>} A <code>Promise</code> that is resolved with the PNG buffer.
   * @public
   */
  convert(source, options) {
    this[_validate]();

    options = Converter[_parseOptions](options);

    return this[_convert](source, options);
  }

  /**
   * Converts the SVG file at the specified path into a PNG using the <code>options</code> provided and writes it to the
   * the target file.
   *
   * The target file is derived from <code>sourceFilePath</code> unless the <code>targetFilePath</code> option is
   * specified.
   *
   * If the width and/or height cannot be derived from the source file then they must be provided via their
   * corresponding options. This method attempts to derive the dimensions from the source file via any
   * <code>width</code>/<code>height</code> attributes or its calculated <code>viewBox</code> attribute.
   *
   * This method is resolved with the path of the target (PNG) file for reference.
   *
   * An error will occur if this {@link Converter} has been destroyed, the source file does not contain an SVG element,
   * no <code>width</code> and/or <code>height</code> options were provided and this information could not be derived
   * from source file, or a problem arises while reading the source file or writing the target file.
   *
   * @param {string} sourceFilePath - the path of the SVG file to be converted to a PNG file
   * @param {Converter~ConvertFileOptions} [options] - the options to be used
   * @return {Promise.<string, Error>} A <code>Promise</code> that is resolved with the target file path.
   * @public
   */
  async convertFile(sourceFilePath, options) {
    this[_validate]();

    options = Converter[_parseOptions](options, sourceFilePath);

    const source = await readFile(sourceFilePath);
    const target = await this[_convert](source, options);

    await writeFile(options.targetFilePath, target);

    return options.targetFilePath;
  }

  /**
   * Destroys this {@link Converter}.
   *
   * This will close any headless Chromium browser that has been opend by this {@link Converter} as well as deleting any
   * temporary file that it may have created.
   *
   * Once destroyed, this {@link Converter} should be discarded and a new one created, if needed.
   *
   * An error will occur if any problem arises while closing the browser, where applicable.
   *
   * @return {Promise.<void, Error>} A <code>Promise</code> for the asynchronous browser interactions.
   * @public
   */
  async destroy() {
    if (this[_destroyed]) {
      return;
    }

    this[_destroyed] = true;

    if (this[_tempFile]) {
      this[_tempFile].cleanup();
      delete this[_tempFile];
    }
    if (this[_browser]) {
      await this[_browser].close();
      delete this[_browser];
      delete this[_page];
    }
  }

  async [_convert](source, options) {
    source = Buffer.isBuffer(source) ? source.toString('utf8') : source;

    const start = source.indexOf('<svg');

    let html = `<!DOCTYPE html><base href="${options.baseUrl}"><style>* { margin: 0; padding: 0; }</style>`;
    if (start >= 0) {
      html += source.substring(start);
    } else {
      throw new Error('SVG element open tag not found in source. Check the SVG source');
    }

    const page = await this[_getPage](html);

    await this[_setDimensions](page, options);

    const dimensions = await this[_getDimensions](page);
    if (!dimensions) {
      throw new Error('Unable to derive width and height from SVG. Consider specifying corresponding options');
    }

    await page.setViewport({
      width: Math.round(dimensions.width),
      height: Math.round(dimensions.height)
    });

    const target = await page.screenshot({
      clip: Object.assign({ x: 0, y: 0 }, dimensions),
      omitBackground: true
    });

    return target;
  }

  [_getDimensions](page) {
    return page.evaluate(() => {
      const el = document.querySelector('svg');
      if (!el) {
        return null;
      }

      const widthIsPercent = (el.getAttribute('width') || '').endsWith('%');
      const heightIsPercent = (el.getAttribute('height') || '').endsWith('%');
      const width = !widthIsPercent && parseFloat(el.getAttribute('width'));
      const height = !heightIsPercent && parseFloat(el.getAttribute('height'));

      if (width && height) {
        return { width, height };
      }

      const viewBoxWidth = el.viewBox.animVal.width;
      const viewBoxHeight = el.viewBox.animVal.height;

      if (width && viewBoxHeight) {
        return {
          width,
          height: width * viewBoxHeight / viewBoxWidth
        };
      }

      if (height && viewBoxWidth) {
        return {
          width: height * viewBoxWidth / viewBoxHeight,
          height
        };
      }

      return null;
    });
  }

  async [_getPage](html) {
    if (!this[_browser]) {
      this[_browser] = await puppeteer.launch();
      this[_page] = await this[_browser].newPage();
    }

    const tempFile = await this[_getTempFile]();

    await writeFile(tempFile.path, html);

    await this[_page].goto(fileUrl(tempFile.path));

    return this[_page];
  }

  [_getTempFile]() {
    if (this[_tempFile]) {
      return Promise.resolve(this[_tempFile]);
    }

    return new Promise((resolve, reject) => {
      tmp.file({ prefix: 'convert-svg-to-png-', postfix: '.html' }, (error, filePath, fd, cleanup) => {
        if (error) {
          reject(error);
        } else {
          this[_tempFile] = { path: filePath, cleanup };

          resolve(this[_tempFile]);
        }
      });
    });
  }

  async [_setDimensions](page, dimensions) {
    if (typeof dimensions.width !== 'number' && typeof dimensions.height !== 'number') {
      return;
    }

    await page.evaluate(({ width, height }) => {
      const el = document.querySelector('svg');
      if (!el) {
        return;
      }

      if (typeof width === 'number') {
        el.setAttribute('width', `${width}px`);
      } else {
        el.removeAttribute('width');
      }

      if (typeof height === 'number') {
        el.setAttribute('height', `${height}px`);
      } else {
        el.removeAttribute('height');
      }
    }, dimensions);
  }

  [_validate]() {
    if (this[_destroyed]) {
      throw new Error('Converter has been destroyed. A new Converter must be created');
    }
  }

  /**
   * Returns whether this {@link Converter} has been destroyed.
   *
   * @return {boolean} <code>true</code> if destroyed; otherwise <code>false</code>.
   * @see {@link Converter#destroy}
   * @public
   */
  get destroyed() {
    return this[_destroyed];
  }

}

module.exports = Converter;

/**
 * The options that can be passed to {@link Converter#convertFile}.
 *
 * @typedef {Converter~ConvertOptions} Converter~ConvertFileOptions
 * @property {string} [targetFilePath] - The path of the file to which the PNG output should be written to. By default,
 * this will be derived from the source file path.
 */

/**
 * The options that can be passed to {@link Converter#convert}.
 *
 * @typedef {Object} Converter~ConvertOptions
 * @property {string} [baseFile] - The path of the file to be converted into a file URL to use for all relative URLs
 * contained within the SVG. When specified, this will always take precedence over the <code>baseUrl</code> option.
 * @property {string} [baseUrl] - The base URL to use for all relative URLs contained within the SVG. Ignored if
 * <code>baseFile</code> option is also specified.
 * @property {number|string} [height] - The height of the PNG to be generated. If omitted, an attempt will be made to
 * derive the height from the SVG source.
 * @property {number|string} [width] - The width of the PNG to be generated. If omitted, an attempt will be made to
 * derive the width from the SVG source.
 */
