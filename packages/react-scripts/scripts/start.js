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
const {
  choosePort,
  createCompiler,
  prepareUrls,
} = require('react-dev-utils/WebpackDevServerUtils');
const paths = require('../config/paths');
const makeDevConfig = require('../config/webpack.config.dev');
const hotReloadServer = require('../lib/hot-update/server');
const { setupBuild, processPublicFolder } = require('../lib/setup');

const useYarn = fs.existsSync(paths.yarnLockFile);
const isInteractive = false && process.stdout.isTTY;

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
    const appName = require(paths.appPackageJson).name;
    const urls = prepareUrls(protocol, HOST, port);
    const hotUpdateServerUrl = urls.localUrlForBrowser;
    const hotUpdateHost = url.parse(hotUpdateServerUrl).hostname;
    // Create a webpack compiler that is configured with custom messages.
    const config = makeDevConfig(
      setupBuild(paths, hotUpdateHost),
      hotUpdateServerUrl
    );
    const compiler = createCompiler(webpack, config, appName, urls, useYarn);
    // Instructions printed by CRA are not relevant, so we replace them on success.
    patchInstructions(compiler);
    // We use compiler watch instead of webpack-dev-server,
    // since extensions need files written to disk, but not served over http.
    const compilerWatch = compiler.watch({}, () => {});

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
    const hotReload = hotReloadServer(compiler).listen(port, HOST, () => {
      console.log(chalk.cyan('Starting the development server...\n'));
    });

    // Also watch and copy the public directory.
    const appPublicWatch = chokidar
      .watch(paths.appPublic, {
        ignoreInitial: true,
      })
      .on('all', () => {
        console.log('Copying public folder...');
        processPublicFolder(paths, hotUpdateHost);
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
      )} directory as a temporary extension in your browser.`
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
