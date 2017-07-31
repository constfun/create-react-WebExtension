// @remove-on-eject-begin
/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */
// @remove-on-eject-end
'use strict';

// Do this as the first thing so that any code reading it knows the right env.
process.env.BABEL_ENV = 'development';
process.env.NODE_ENV = 'development';

// Makes the script crash on unhandled rejections instead of silently
// ignoring them. In the future, promise rejections that are not handled will
// terminate the Node.js process with a non-zero exit code.
process.on('unhandledRejection', err => {
  throw err;
});

// Ensure environment variables are read.
require('../config/env');

const path = require('path');
const chalk = require('chalk');
const fs = require('fs-extra');
const webpack = require('webpack');
const config = require('../config/webpack.config.dev');
const paths = require('../config/paths').getPaths();
const checkRequiredFiles = require('react-dev-utils/checkRequiredFiles');
const formatWebpackMessages = require('react-dev-utils/formatWebpackMessages');
const printHostingInstructions = require('react-dev-utils/printHostingInstructions');
const FileSizeReporter = require('react-dev-utils/FileSizeReporter');
const copyPublicFolder = require('./utils/copyPublicFolder');

// Warn and crash if required files are missing
// if (!checkRequiredFiles([paths.appHtml, paths.appIndexJs])) {
//   process.exit(1);
// }

console.log('Starting development server...');

// Remove all content but keep the directory so that
// if you're in it, you don't end up in Trash
fs.emptyDirSync(paths.appBuild);
// Merge with the public folder
copyPublicFolder();

const compiler = webpack(config);
compiler.watch({}, (err, stats) => {
  if (err) {
    console.log(err, '\nWatch failed');
  }
  const messages = formatWebpackMessages(stats.toJson({}, true));
  if (messages.errors.length) {
    return printError(new Error(messages.errors.join('\n\n')));
  }
  if (
    process.env.CI &&
    (typeof process.env.CI !== 'string' ||
      process.env.CI.toLowerCase() !== 'false') &&
    messages.warnings.length
  ) {
    console.log(
      chalk.yellow(
        '\nTreating warnings as errors because process.env.CI = true.\n' +
          'Most CI servers set it automatically.\n'
      )
    );
    return printError(new Error(messages.warnings.join('\n\n')));
  }

  if (messages.warnings.length) {
    console.log(chalk.yellow('Compiled with warnings.\n'));
    console.log(messages.warnings.join('\n\n'));
    console.log(
      '\nSearch for the ' +
        chalk.underline(chalk.yellow('keywords')) +
        ' to learn more about each warning.'
    );
    console.log(
      'To ignore, add ' +
        chalk.cyan('// eslint-disable-next-line') +
        ' to the line before.\n'
    );
  } else {
    console.log(chalk.green('Compiled successfully.\n'));
  }
});

const printError = err => {
  console.log(chalk.red('Failed to compile.\n'));
  console.log((err.message || err) + '\n');
  // process.exit(1);
};
