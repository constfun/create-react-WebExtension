'use strict';

const url = require('url');
const fs = require('fs-extra');
const path = require('path');
const checkRequiredFiles = require('react-dev-utils/checkRequiredFiles');
const { loadBundles } = require('./bundle');

const processPublicFolder = (appPaths, hotUpdateUrl) => {
  fs.copySync(appPaths.appPublic, appPaths.appBuild, {
    dereference: true,
  });

  if (process.env.NODE_ENV === 'development') {
    setupHotUpdateSupport(appPaths, hotUpdateUrl);
  }
};

const setupHotUpdateSupport = (appPaths, hotUpdateUrl) => {
  if (process.env.NODE_ENV !== 'development') {
    throw 'Hot module reload is only supported in development.';
  }

  // Inject the hot update server url and copy the runtime into the build dir.
  const relRuntimePathInBuild = 'js/hot-update-background-runtime.js';
  // const runtimePathInBuild = path.join(
  //   appPaths.appBuild,
  //   relRuntimePathInBuild
  // );
  // const runtimePath = require.resolve('./hot-update/background-runtime');
  // const runtime =
  //   `const hotUpdateUrl = '${hotUpdateUrl}';\n\n` +
  //   fs.readFileSync(runtimePath);
  // fs.writeFileSync(runtimePathInBuild, runtime);

  // Add hot reload scripts to the manifest file.
  const manifestInBuild = path.join(appPaths.appBuild, 'manifest.json');
  // We're requiring a json file, so make sure we don't get a cached version.
  delete require.cache[require.resolve(appPaths.appManifest)];
  let manifest = require(appPaths.appManifest);
  manifest = injectBackgroundScript(manifest, relRuntimePathInBuild);
  manifest = injectHotUpdateHostPermission(manifest, hotUpdateUrl);
  fs.writeFileSync(manifestInBuild, JSON.stringify(manifest, null, 2));
};

const injectBackgroundScript = (manifest, bgScriptRelPath) => {
  manifest.background = manifest.background || {};
  manifest.background.scripts = manifest.background.scripts || [];
  manifest.background.scripts.push(bgScriptRelPath);
  return manifest;
};

const injectHotUpdateHostPermission = (manifest, hotUpdateUrl) => {
  const { hostname } = url.parse(hotUpdateUrl);
  const requiredPermission = `*://${hostname}/*`;
  manifest.permissions = manifest.permissions || [];
  if (!manifest.permissions.includes(requiredPermission)) {
    manifest.permissions.push(requiredPermission);
  }
  return manifest;
};

const setupBuild = (appPaths, hotUpdateUrl) => {
  // Warn and crash if required files are missing.
  if (!checkRequiredFiles([appPaths.appManifest])) {
    process.exit(1);
  }

  fs.emptyDirSync(appPaths.appBuild);
  processPublicFolder(appPaths, hotUpdateUrl);
  return loadBundles(appPaths);
};

module.exports = {
  setupBuild,
  processPublicFolder,
};
