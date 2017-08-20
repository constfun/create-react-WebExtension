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

const fs = require('fs');
const url = require('url');
const chalk = require('chalk');
const webpack = require('webpack');
const chokidar = require('chokidar');
const clearConsole = require('react-dev-utils/clearConsole');
const {
  choosePort,
  prepareUrls,
} = require('react-dev-utils/WebpackDevServerUtils');
const paths = require('../config/paths');
const makeDevConfig = require('../config/webpack.config.dev');
const makeHotUpdateServer = require('../lib/hot-update/server');
const { setupBuild, processPublicFolder } = require('../lib/setup');
const { withInstructions, printCompilationStats } = require('../lib/format');

const isInteractive = process.stdout.isTTY;
const useYarn = fs.existsSync(paths.yarnLockFile);

// Tools like Cloud9 rely on this.
const DEFAULT_PORT = parseInt(process.env.PORT, 10) || 3000;
const HOST = process.env.HOST || '0.0.0.0';

// We attempt to use the default port but if it is busy, we offer the user to
// run on a different port. `detect()` Promise resolves to the next free port.
choosePort(HOST, DEFAULT_PORT)
  .then(port => {
    if (port == null) {
      // We have not found a port.
      return;
    }
    const urls = prepareUrls('http', HOST, port);
    const hotUpdateUrl = url.resolve(
      urls.localUrlForBrowser,
      'web_ext_hot_update'
    );
    // Process public folder, load all bundles, and create webpack config.
    const bundles = setupBuild(paths);
    const config = makeDevConfig(bundles, hotUpdateUrl);
    // Create a webpack compiler that is configured with custom messages.
    const compiler = withInstructions(webpack(config), useYarn);
    let isFirstCompilation = true;
    const compilerWatch = compiler.watch({}, (err, stats) => {
      if (err) {
        console.log(err, chalk.red('\nCompiler watch failed'));
        process.exit(1);
      }

      printCompilationStats({
        stats,
        isFirstCompilation,
        useYarn,
      });
      isFirstCompilation = false;
    });

    // Loading proxy config is not implemented yet, check and fail.
    const proxySetting = require(paths.appPackageJson).proxy;
    if (proxySetting) {
      console.log(
        chalk.red(
          'Dev server settings are not supported by Create React WebExtension.'
        )
      );
      process.exit(1);
    }

    // We use a custom, small, express server to just serve hot reload notifications.
    const hotUpdateServer = makeHotUpdateServer(compiler, { hotUpdateUrl });
    hotUpdateServer.listen(port, HOST, () => {
      console.log(chalk.cyan('Starting the development server...\n'));
    });

    // Also watch and copy the public directory.
    const appPublicWatch = chokidar
      .watch(paths.appPublic, {
        ignoreInitial: true,
      })
      .on('all', () => {
        console.log('Copying public folder...');
        processPublicFolder(paths)
          .then(() => {
            if (isInteractive) {
              clearConsole();
            }
            console.log(chalk.green('Compiled successfully!'));
            hotUpdateServer.force();
          })
          .catch((err) => {
            if (isInteractive) {
              clearConsole();
            }
            console.log(chalk.red('Error processing public folder.\n'));
            console.log(err);
          });
      });

    ['SIGINT', 'SIGTERM'].forEach(function(sig) {
      process.on(sig, function() {
        compilerWatch.close();
        appPublicWatch.close();
        hotUpdateServer.close();
        process.exit();
      });
    });
  })
  .catch(err => {
    if (err && err.message) {
      console.log(err.message);
    }
    process.exit(1);
  });

