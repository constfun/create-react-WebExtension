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

const path = require('path');
const fs = require('fs');
const url = require('url');
const Pack = require('./pack');

const getPaths = pack => {
  let paths = {};

  // Make sure any symlinks in the project folder are resolved:
  // https://github.com/facebookincubator/create-react-app/issues/637
  const appDirectory = fs.realpathSync(process.cwd());
  const resolveApp = relativePath => path.resolve(appDirectory, relativePath);
  const resolveBuild = relativePath => {
    const appBuildDir = resolveApp(relativePath);
    return pack ? path.join(appBuildDir, Pack.name(pack)) : appBuildDir;
  };
  const resolvePack = relativePath => {
    if (!pack) {
      return resolveApp(relativePath);
    }

    return path.resolve(appDirectory, `${Pack.dir(pack)}/${relativePath}`);
  };

  const envPublicUrl = process.env.PUBLIC_URL;

  function ensureSlash(path, needsSlash) {
    const hasSlash = path.endsWith('/');
    if (hasSlash && !needsSlash) {
      return path.substr(path, path.length - 1);
    } else if (!hasSlash && needsSlash) {
      return `${path}/`;
    } else {
      return path;
    }
  }

  const getPublicUrl = appPackageJson => {
    let appPublicUrl = envPublicUrl || require(appPackageJson).homepage;
    if (appPublicUrl) {
      return pack
        ? ensureSlash(appPublicUrl, true) + Pack.name(pack)
        : appPublicUrl;
    } else {
      return pack ? Pack.name(pack) : undefined;
    }
  };

  // We use `PUBLIC_URL` environment variable or "homepage" field to infer
  // "public path" at which the app is served.
  // Webpack needs to know it to put the right <script> hrefs into HTML even in
  // single-page apps that may serve index.html for nested URLs like /todos/42.
  // We can't use a relative path in HTML because we don't want to load something
  // like /todos/42/static/js/bundle.7289d.js. We have to know the root.
  function getServedPath(appPackageJson) {
    const publicUrl = getPublicUrl(appPackageJson);
    const servedUrl =
      (pack
        ? ensureSlash(envPublicUrl, true) + Pack.name(pack)
        : envPublicUrl) || (publicUrl ? url.parse(publicUrl).pathname : '/');
    return ensureSlash(servedUrl, true);
  }

  // config after eject: we're in ./config/
  paths = {
    dotenv: resolveApp('.env'),
    appBuild: resolveBuild('build'),
    appPublic: resolvePack('public'),
    appHtml: resolvePack('public/index.html'),
    appIndexJs: resolvePack('src/index.tsx'),
    appPackageJson: resolveApp('package.json'),
    appSrc: resolvePack('src'),
    yarnLockFile: resolveApp('yarn.lock'),
    testsSetup: resolvePack('src/setupTests.ts'),
    appNodeModules: resolveApp('node_modules'),
    appTsConfig: resolveApp('tsconfig.json'),
    publicUrl: getPublicUrl(resolveApp('package.json')),
    servedPath: getServedPath(resolveApp('package.json')),
  };

  // @remove-on-eject-begin
  const resolveOwn = relativePath =>
    path.resolve(__dirname, '..', relativePath);

  // config before eject: we're in ./node_modules/react-scripts/config/
  paths = {
    dotenv: resolveApp('.env'),
    appPath: resolveApp('.'),
    appBuild: resolveBuild('build'),
    appPublic: resolvePack('public'),
    appHtml: resolvePack('public/index.html'),
    appIndexJs: resolvePack('src/index.tsx'),
    appPackageJson: resolveApp('package.json'),
    appSrc: resolvePack('src'),
    yarnLockFile: resolveApp('yarn.lock'),
    testsSetup: resolvePack('src/setupTests.ts'),
    appNodeModules: resolveApp('node_modules'),
    appTsConfig: resolveApp('tsconfig.json'),
    publicUrl: getPublicUrl(resolveApp('package.json')),
    servedPath: getServedPath(resolveApp('package.json')),
    // These properties only exist before ejecting:
    ownPath: resolveOwn('.'),
    ownNodeModules: resolveOwn('node_modules'), // This is empty on npm 3
  };

  const ownPackageJson = require('../package.json');
  const reactScriptsPath = resolveApp(`node_modules/${ownPackageJson.name}`);
  const reactScriptsLinked =
    fs.existsSync(reactScriptsPath) &&
    fs.lstatSync(reactScriptsPath).isSymbolicLink();

  // config before publish: we're in ./packages/react-scripts/config/
  if (
    !reactScriptsLinked &&
    __dirname.indexOf(path.join('packages', 'react-scripts', 'config')) !== -1
  ) {
    paths = {
      dotenv: resolveOwn('template/.env'),
      appPath: resolveApp('.'),
      appBuild: resolveBuild('../../build'),
      appPublic: resolveOwn('template/public'),
      appHtml: resolveOwn('template/public/index.html'),
      appIndexJs: resolveOwn('template/src/index.tsx'),
      appPackageJson: resolveOwn('package.json'),
      appSrc: resolveOwn('template/src'),
      yarnLockFile: resolveOwn('template/yarn.lock'),
      testsSetup: resolveOwn('template/src/setupTests.ts'),
      appNodeModules: resolveOwn('node_modules'),
      appTsConfig: resolveOwn('template/tsconfig.json'),
      publicUrl: getPublicUrl(resolveOwn('package.json')),
      servedPath: getServedPath(resolveOwn('package.json')),
      // These properties only exist before ejecting:
      ownPath: resolveOwn('.'),
      ownNodeModules: resolveOwn('node_modules'),
    };
  }
  // @remove-on-eject-end

  return paths;
};

module.exports = getPaths;
