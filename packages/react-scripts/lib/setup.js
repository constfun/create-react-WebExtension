'use strict';

const fs = require('fs-extra');
const path = require('path');
const { loadApp, loadBundles } = require('./bundle');

const processPublicFolder = (appPaths, hotReloadUrl) => {
  copyUnprocessedPublicFiles(appPaths);
  processManifestFile(appPaths, hotReloadUrl);
};

const copyUnprocessedPublicFiles = appPaths => {
  fs.copySync(appPaths.appPublic, appPaths.appBuild, {
    dereference: true,
    filter: file => file !== appPaths.appHtml && file !== appPaths.appManifest,
  });
};

const processManifestFile = (appPaths, hotReloadUrl) => {
  const dest = path.join(appPaths.appBuild, 'manifest.json');
  // In development we inject extra permissions to support hot reload.
  if (process.env.NODE_ENV === 'development') {
    // We're requiring a json file, so make sure we don't get a cached version.
    delete require.cache[require.resolve(appPaths.appManifest)];
    const manifest = require(appPaths.appManifest);
    fs.writeFileSync(
      dest,
      JSON.stringify(
        injectDevServerPermissionsIntoManifest(manifest, hotReloadUrl),
        null,
        2
      )
    );
  } else {
    fs.copySync(appPaths.appManifest, dest);
  }
};

const injectDevServerPermissionsIntoManifest = (manifest, hotReloadUrl) => {
  const requiredPermission = `${hotReloadUrl}/*`;
  manifest.permissions = manifest.permissions || [];
  if (!manifest.permissions.includes(requiredPermission)) {
    manifest.permissions.push(requiredPermission);
  }
  return manifest;
};

const setupBuild = hotReloadUrl => {
  const appPaths = require('../config/paths');

  fs.emptyDirSync(appPaths.appBuild);
  processPublicFolder(appPaths, hotReloadUrl);

  const app = loadApp(appPaths);
  const bundles = [].concat(app, loadBundles(app));
  return bundles.filter(p => p.indexJs);
};

module.exports = {
  setupBuild,
  processPublicFolder,
};
