'use strict';

const fs = require('fs-extra');
const path = require('path');
const checkRequiredFiles = require('react-dev-utils/checkRequiredFiles');
const { loadBundles } = require('./bundle');

const processPublicFolder = (appPaths, devServerHost) => {
  fs.copySync(appPaths.appPublic, appPaths.appBuild, {
    dereference: true,
  });

  if (process.env.NODE_ENV === 'development') {
    setupHotReloadSupport(appPaths, devServerHost);
  }
};

const setupHotReloadSupport = (appPaths, devServerHost) => {
  if (process.env.NODE_ENV !== 'development') {
    throw 'Hot module reload is only supported in development.';
  }

  // Copy over hot update service script to the build dir.
  const bgScriptRelPath = 'js/hot-update-runtime.js';
  const bgScript = require.resolve('./hot-update/background-runtime');
  const bgScriptInBuild = path.join(appPaths.appBuild, bgScriptRelPath);
  fs.copySync(bgScript, bgScriptInBuild);

  // Add hot reload scripts to the manifest file.
  const manifestInBuild = path.join(appPaths.appBuild, 'manifest.json');
  // We're requiring a json file, so make sure we don't get a cached version.
  delete require.cache[require.resolve(appPaths.appManifest)];
  let manifest = require(appPaths.appManifest);
  manifest = injectBackgroundScript(manifest, bgScriptRelPath);
  manifest = injectDevServerHostPermission(manifest, devServerHost);
  fs.writeFileSync(manifestInBuild, JSON.stringify(manifest, null, 2));
};

const injectBackgroundScript = (manifest, bgScriptRelPath) => {
  // Make sure the 'background' entry exists in the manifest.
  manifest.background = manifest.background || {};
  manifest.background.scripts = manifest.background.scripts || [];
  // Add our hot update script.
  manifest.background.scripts.push(bgScriptRelPath);
  return manifest;
};

const injectDevServerHostPermission = (manifest, devServerHost) => {
  const requiredPermission = `*://${devServerHost}/*`;
  manifest.permissions = manifest.permissions || [];
  if (!manifest.permissions.includes(requiredPermission)) {
    manifest.permissions.push(requiredPermission);
  }
  return manifest;
};

const setupBuild = (appPaths, devServerHost) => {
  // Warn and crash if required files are missing.
  if (!checkRequiredFiles([appPaths.appManifest])) {
    process.exit(1);
  }

  fs.emptyDirSync(appPaths.appBuild);
  processPublicFolder(appPaths, devServerHost);
  return loadBundles(appPaths);
};

module.exports = {
  setupBuild,
  processPublicFolder,
};
