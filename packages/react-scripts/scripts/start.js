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
const chokidar = require('chokidar');
const chalk = require('chalk');
const webpack = require('webpack');
const {
  choosePort,
  prepareUrls,
} = require('react-dev-utils/WebpackDevServerUtils');
const appPaths = require('../config/paths');
const makeDevConfig = require('../config/webpack.config.dev');
const hotReloadServer = require('../lib/hot-reload/server');
const { setupBuild, copyPublicFolder } = require('../lib/setup');
const { printCompilationStats } = require('../lib/format');

const useYarn = fs.existsSync(appPaths.yarnLockFile);
const isInteractive = process.stdout.isTTY;

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
    const protocol = process.env.HTTPS === 'true' ? 'https' : 'http';
    // Dev config needs to know the extact hot reload server url,
    // since it is impossible to infer on the client, we're in a sandbox.
    const hotReloadServerUrl = `${protocol}://${HOST}:${port}`;

    // This is webpack mutli-compiler config, one for the app itself and one per bundle.
    const config = setupBuild().map(bundle =>
      makeDevConfig(bundle, hotReloadServerUrl)
    );
    // We use compiler watch instead of webpack-dev-server,
    // since extensions needs files written to disk,
    // and don't need files served via http.
    let isFirstCompilation = true;
    const compiler = webpack(config);
    const compilerWatch = compiler.watch({}, (err, stats) => {
      if (err) {
        console.log(err, chalk.red('\nCompiler watch failed'));
        process.exit(1);
      }

      printCompilationStats({
        stats,
        isFirstCompilation,
        isInteractive,
        useYarn,
      });
      isFirstCompilation = false;
    });

    // Loading proxy config is not implemented yet, check and fail.
    const proxySetting = require(appPaths.appPackageJson).proxy;
    if (proxySetting) {
      console.log(
        chalk.red(
          'Dev server settings are not supported by Create React WebExtension.'
        )
      );
      process.exit(1);
    }

    // We use a custom, small, express server to just serve hot reload notifications.
    const hotReload = hotReloadServer(compiler).listen(port, HOST, () => {
      console.log(chalk.cyan('Starting the development server...\n'));
    });

    // Also watch and copy the public directory.
    const appPublicWatch = chokidar
      .watch(appPaths.appPublic, {
        ignoreInitial: true,
        awaitWriteFinish: true,
      })
      .on('all', () => {
        copyPublicFolder(appPaths);
        hotReload.force();
      });

    ['SIGINT', 'SIGTERM'].forEach(function(sig) {
      process.on(sig, function() {
        compilerWatch.close();
        appPublicWatch.close();
        hotReload.close();
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
