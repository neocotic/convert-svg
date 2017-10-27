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

const chalk = require('chalk');
const { Command } = require('commander');
const { EOL } = require('os');
const fs = require('fs');
const getStdin = require('get-stdin').buffer;
const glob = require('glob');
const path = require('path');
const util = require('util');

const Converter = require('./converter');
const pkg = require('../package.json');

const findFiles = util.promisify(glob);
const writeFile = util.promisify(fs.writeFile);

const _baseDir = Symbol('baseDir');
const _command = Symbol('command');
const _convertFiles = Symbol('convertFiles');
const _convertSource = Symbol('convertSource');
const _errorStream = Symbol('errorStream');
const _inputStream = Symbol('inputStream');
const _outputStream = Symbol('outputStream');

/**
 * The command-line interface for <code>convert-svg-to-png</code>.
 *
 * While technically part of the API, this is not expected to be used outside of this package as it's only intended use
 * is by <code>bin/convert-svg-to-png</code>.
 *
 * @public
 */
class CLI {

  /**
   * Creates an instance of {@link CLI} using the <code>options</code> provided.
   *
   * <code>options</code> is primarily intended for testing purposes and it's not expected to be supplied in any
   * real-world scenario.
   *
   * @param {CLI~Options} [options] - the options to be used
   * @public
   */
  constructor(options = {}) {
    this[_baseDir] = options.baseDir || process.cwd();
    this[_errorStream] = options.errorStream || process.stderr;
    this[_inputStream] = options.inputStream || process.stdin;
    this[_outputStream] = options.outputStream || process.stdout;
    this[_command] = new Command()
      .version(pkg.version)
      .usage('[options] [files...]')
      .option('--no-color', 'disables color output')
      .option('-b, --base-url <url>', 'specify base URL to use for all relative URLs in SVG')
      .option('-f, --filename <filename>', 'specify name the for target PNG file when processing STDIN')
      .option('--height <value>', 'specify height for PNG')
      .option('--width <value>', 'specify width for PNG');
  }

  /**
   * Writes the specified <code>message</code> to the error stream for this {@link CLI}.
   *
   * @param {string} message - the message to be written to the error stream
   * @return {void}
   * @public
   */
  error(message) {
    this[_errorStream].write(`${message}${EOL}`);
  }

  /**
   * Writes the specified <code>message</code> to the output stream for this {@link CLI}.
   *
   * @param {string} message - the message to be written to the output stream
   * @return {void}
   * @public
   */
  output(message) {
    this[_outputStream].write(`${message}${EOL}`);
  }

  /**
   * Parses the command-line (process) arguments provided and performs the necessary actions based on the parsed input.
   *
   * An error will occur if any problem arises.
   *
   * @param {string[]} [args] - the arguments to be parsed
   * @return {Promise.<void, Error>} A <code>Promise</code> for any asynchronous file traversal and/or buffer reading
   * and writing.
   * @public
   */
  async parse(args = []) {
    const command = this[_command].parse(args);
    const converter = new Converter();
    const options = {
      baseUrl: command.baseUrl,
      converter,
      filePath: command.filename ? path.resolve(this.baseDir, command.filename) : null,
      height: command.height,
      width: command.width
    };

    try {
      if (command.args.length) {
        const filePaths = [];

        for (const arg of command.args) {
          const files = await findFiles(arg, {
            absolute: true,
            cwd: this.baseDir,
            nodir: true
          });

          filePaths.push(...files);
        }

        await this[_convertFiles](filePaths, options);
      } else {
        const source = await getStdin();

        await this[_convertSource](source, options);
      }
    } finally {
      await converter.destroy();
    }
  }

  async [_convertFiles](filePaths, options) {
    for (const sourceFilePath of filePaths) {
      const targetFilePath = await options.converter.convertFile(sourceFilePath, {
        baseUrl: options.baseUrl,
        height: options.height,
        width: options.width
      });

      this.output(`Converted SVG file to PNG file: ${chalk.blue(sourceFilePath)} -> ${chalk.blue(targetFilePath)}`);
    }

    this.output(chalk.green('Done!'));
  }

  async [_convertSource](source, options) {
    const target = await options.converter.convert(source, {
      baseFile: !options.baseUrl ? this.baseDir : null,
      baseUrl: options.baseUrl,
      height: options.height,
      width: options.width
    });

    if (options.filePath) {
      await writeFile(options.filePath, target);

      this.output(`Converted SVG input to PNG file: ${chalk.blue(options.filePath)}`);
      this.output(chalk.green('Done!'));
    } else {
      this[_outputStream].write(target);
    }
  }

  /**
   * Returns the base directory for this {@link CLI}.
   *
   * @return {string} The base directory.
   * @public
   */
  get baseDir() {
    return this[_baseDir];
  }

}

module.exports = CLI;

/**
 * The options that can be passed to the {@link CLI} constructor.
 *
 * @typedef {Object} CLI~Options
 * @property {string} [baseDir=process.cwd()] - The base directory to be used.
 * @property {Writable} [errorStream=process.stderr] - The stream for error messages to be written to.
 * @property {Readable} [inputStream=process.stdin] - The stream for input to be read from.
 * @property {Writable} [outputStream=process.stdout] - The stream for output messages to be written to.
 */
