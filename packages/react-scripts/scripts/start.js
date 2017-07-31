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

const chalk = require('chalk');
const webpack = require('webpack');
const clearConsole = require('react-dev-utils/clearConsole');
const { config, PORT, HOST } = require('../config/webpack.config.dev');
const paths = require('../config/paths');
// const checkRequiredFiles = require('react-dev-utils/checkRequiredFiles');
const formatWebpackMessages = require('react-dev-utils/formatWebpackMessages');
const { setupBuildDir } = require('./utils/common');
const devMiddleware = require('webpack-dev-middleware');
const hotReload = require('./utils/hot-reload');

const isInteractive = process.stdout.isTTY;

// Warn and crash if required files are missing
// if (!checkRequiredFiles([paths.appHtml, paths.appIndexJs])) {
//   process.exit(1);
// }

const startServer = (host, port, config) => {
  const compiler = webpack(config);

  compiler.watch({}, (err, stats) => {
    if (err) {
      console.log(err, chalk.red('\nCompiler watch failed'));
    }

    if (isInteractive) {
      clearConsole();
    }

    const messages = formatWebpackMessages(stats.toJson({}, true));
    if (messages.errors.length) {
      printErrors(messages.errors);
    } else {
      printWarnings(messages.warnings);
    }
  });

  const hotReloadServer = hotReload.makeServer(compiler);
  hotReloadServer.listen(port, host, () => {
    console.log(chalk.cyan('Starting the development server...\n'));
  });
};

const printWarnings = warnings => {
  if (warnings.length) {
    console.log(chalk.yellow('Compiled with warnings.\n'));
    console.log(warnings.join('\n\n'));
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
};

const printErrors = errors => {
  if (!errors.length) {
    return;
  }
  console.log(chalk.red('Failed to compile.\n'));
  console.log(errors.join('\n\n') + '\n');
};

setupBuildDir();
startServer(HOST, PORT, config);
