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

const Converter = require('./converter');

/**
 * Converts the specified <code>source</code> SVG into a PNG using the <code>options</code> provided via a headless
 * Chromium instance.
 *
 * <code>source</code> can either be a SVG buffer or string.
 *
 * If the width and/or height cannot be derived from <code>source</code> then they must be provided via their
 * corresponding options. This method attempts to derive the dimensions from <code>source</code> via any
 * <code>width</code>/<code>height</code> attributes or its calculated <code>viewBox</code> attribute.
 *
 * An error will occur if <code>source</code> does not contain an SVG element or no <code>width</code> and/or
 * <code>height</code> options were provided and this information could not be derived from <code>source</code>.
 *
 * @param {Buffer|string} source - the SVG source to be converted to a PNG
 * @param {Converter~ConvertOptions} [options] - the options to be used
 * @return {Promise.<Buffer, Error>} A <code>Promise</code> for the asynchronous conversion that is resolved with the
 * PNG buffer.
 * @public
 */
async function convert(source, options) {
  // Reference method via module.exports to allow unit test to spy on converter
  const converter = module.exports.createConverter();
  let target;

  try {
    target = await converter.convert(source, options);
  } finally {
    await converter.destroy();
  }

  return target;
}

/**
 * Creates an instance of {@link Converter}.
 *
 * It is important to note that, after the first time {@link Converter#convert} is called, a headless Chromium instance
 * will remain open until {@link Converter#destroy} is called. This is done automatically when using the main API
 * <code>convert</code> method within this module, however, when using {@link Converter} diretly, it is the
 * responsibility of the caller. Due to the fact that creating browser instances is expensive, this level of control
 * allows callers to reuse a browser for multiple conversions. For example; one could create a {@link Converter} and use
 * it to convert a collection of SVG files to PNG files and then destroy it afterwards. It's not recommended to keep an
 * instance around for too long, as it will use up resources.
 *
 * @return {Converter} A newly created {@link Converter} instance.
 * @public
 */
function createConverter() {
  return new Converter();
}

module.exports = { convert, createConverter };
