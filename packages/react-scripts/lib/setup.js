'use strict';

const fs = require('fs-extra');
const path = require('path');
const chalk = require('chalk');
const checkRequiredFiles = require('react-dev-utils/checkRequiredFiles');
const { loadBundles } = require('./bundle');

const processPublicFolder = (appPaths) => {
  fs.copySync(appPaths.appPublic, appPaths.appBuild, {
    dereference: true,
  });

  if (process.env.NODE_ENV === 'development') {
    return new Promise((resolve, reject) => {
      try {
        setupHotUpdateSupport(appPaths);
        resolve();
      }
      // Thrown when there is a syntax error in the manifest file.
      catch (err) {
        if (err instanceof SyntaxError) {
          reject(err.message);
        }
      }
    });
  }
  else {
    return Promise.resolve();
  }
};

const setupHotUpdateSupport = (appPaths) => {
  if (process.env.NODE_ENV !== 'development') {
    throw 'Hot module reload is only supported in development.';
  }

  // Add hot update background scripts to the manifest file.
  const bgScriptRelPath = 'js/hot-update-background-script.js';
  const manifestInBuild = path.join(appPaths.appBuild, 'manifest.json');
  // We're requiring a json file that might have changed while we were "watching",
  // make sure we don't get a cached version.
  delete require.cache[require.resolve(appPaths.appManifest)];
  let manifest = require(appPaths.appManifest);
  manifest.name += ' (Dev Build)';
  manifest = injectBackgroundScript(manifest, bgScriptRelPath);
  manifest = injectHotUpdateHostPermission(manifest);
  fs.writeFileSync(manifestInBuild, JSON.stringify(manifest, null, 2));
};

const injectBackgroundScript = (manifest, bgScriptRelPath) => {
  manifest.background = manifest.background || {};
  manifest.background.scripts = manifest.background.scripts || [];
  if (!manifest.background.scripts.includes(bgScriptRelPath)) {
    manifest.background.scripts.push(bgScriptRelPath);
  }
  return manifest;
};

const injectHotUpdateHostPermission = (manifest) => {
  const requiredPermission = '<all_urls>';
  manifest.permissions = manifest.permissions || [];
  if (!manifest.permissions.includes(requiredPermission)) {
    manifest.permissions.push(requiredPermission);
  }
  return manifest;
};

const setupBuild = (appPaths) => {
  // Warn and crash if required files are missing.
  if (!checkRequiredFiles([appPaths.appManifest])) {
    process.exit(1);
  }

  fs.emptyDirSync(appPaths.appBuild);
  processPublicFolder(appPaths)
    .catch((err) => {
      console.log(chalk.red('Error processing public folder.\n'));
      console.log(err);
      process.exit(1);
    });
  return loadBundles(appPaths);
};

module.exports = {
  setupBuild,
  processPublicFolder,
};
