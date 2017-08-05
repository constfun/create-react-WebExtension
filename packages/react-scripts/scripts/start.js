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
  createCompiler,
} = require('react-dev-utils/WebpackDevServerUtils');
const clearConsole = require('react-dev-utils/clearConsole');
const appPaths = require('../config/paths');
const makeDevConfig = require('../config/webpack.config.dev');
const hotReloadServer = require('../lib/hot-reload/server');
const { setupBuild, processPublicFolder } = require('../lib/setup');

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
    const config = makeDevConfig(
      setupBuild(hotReloadServerUrl),
      hotReloadServerUrl
    );

    const compiler = createCompiler(webpack, config, '', {}, true);
    // Instructions printed by CRA are not relevant, so we replace them on success.
    patchInstructions(compiler);
    // We use compiler watch instead of webpack-dev-server,
    // since extensions need files written to disk, but not served over http.
    const compilerWatch = compiler.watch({}, () => {});

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
      })
      .on('all', () => {
        console.log('Copying public folder...');
        processPublicFolder(appPaths, hotReloadServerUrl);
        hotReload.force();
        console.log('Done.');
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

const patchInstructions = compiler => {
  let isFirstCompile = true;
  compiler.plugin('done', stats => {
    const isSuccessful = !stats.hasErrors() && !stats.hasWarnings();
    if (isSuccessful && (isInteractive || isFirstCompile)) {
      clearConsole();
      console.log(chalk.green('Compiled successfully!'));
      printInstructions();
    }
    isFirstCompile = false;
  });
};

const printInstructions = () => {
  console.log();
  console.log(
    chalk.green(
      `You can now load the ${chalk.bold(
        'build'
      )} directory as a temporary extension.`
    )
  );
  console.log();
  console.log('Note that the development build is not optimized.');
  console.log(
    `To create a production build, use ` +
      `${chalk.cyan(`${useYarn ? 'yarn' : 'npm run'} build`)}.`
  );
  console.log();
};
