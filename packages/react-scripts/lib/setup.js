'use strict';

const fs = require('fs-extra');
const path = require('path');
const { loadApp, loadBundles } = require('./bundle');

const copyPublicFolder = appPaths => {
  fs.copySync(appPaths.appPublic, appPaths.appBuild, {
    dereference: true,
    filter: file => file !== appPaths.appHtml,
  });

  // In development we inject extra permissions to support hot reload.
  if (process.env.NODE_ENV === 'development') {
    delete require.cache[require.resolve(appPaths.appManifest)];
    const manifest = require(appPaths.appManifest);
    fs.writeFileSync(
      path.join(appPaths.appBuild, 'manifest.json'),
      JSON.stringify(injectDevServerPermissionsIntoManifest(manifest), null, 2)
    );
  }
};

const injectDevServerPermissionsIntoManifest = manifest => {
  const { URL } = require('../config/webpack.config.dev');
  const permString = `${URL}/*`;

  manifest.permissions = manifest.permissions || [];
  if (!manifest.permissions.includes(permString)) {
    manifest.permissions.push(permString);
  }
  return manifest;
};

const setupBuild = () => {
  const appPaths = require('../config/paths');

  fs.emptyDirSync(appPaths.appBuild);
  copyPublicFolder(appPaths);

  const app = loadApp(appPaths);
  const bundles = [].concat(app, loadBundles(app));
  return bundles.filter(p => p.indexJs);
};

module.exports = {
  setupBuild,
  copyPublicFolder,
};
