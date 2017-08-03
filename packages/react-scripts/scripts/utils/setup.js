'use strict';

const fs = require('fs-extra');
const path = require('path');
const { loadApp, loadBundles } = require('./bundle');

const copyPublicFolder = bundle => {
  if (bundle.publicPath === null) {
    return;
  }
  fs.copySync(bundle.publicPath, bundle.buildPath, {
    dereference: true,
    filter: file => file !== bundle.indexHtml,
  });
};

const manifestPaths = appPaths => {
  const { appPublic, appBuild } = appPaths;
  const manifestSrc = path.join(appPublic, 'manifest.json');
  const manifestDest = path.join(appBuild, 'manifest.json');
  return { manifestSrc, manifestDest };
};

const copyProdManifest = appPaths => {
  const { manifestSrc, manifestDest } = manifestPaths(appPaths);
  fs.copySync(manifestSrc, manifestDest);
};

const copyDevManifest = appPaths => {
  if (process.env.NODE_ENV !== 'development') {
    throw 'Asked to copy development version of the manifest in a non-development environment.';
  }

  const { manifestSrc, manifestDest } = manifestPaths(appPaths);
  const manifest = require(manifestSrc);
  fs.writeFileSync(
    manifestDest,
    JSON.stringify(injectDevServerPermissions(manifest), null, 2)
  );
};

const injectDevServerPermissions = manifest => {
  const { URL } = require('../../config/webpack.config.dev');
  const permString = `${URL}/*`;

  manifest.permissions = manifest.permissions || [];
  if (!manifest.permissions.includes(permString)) {
    manifest.permissions.push(permString);
  }
  return manifest;
};

const setupBuildDir = (appPaths, bundles) => {
  // Clean.
  fs.emptyDirSync(appPaths.appBuild);
  // Merge public folders.
  bundles.forEach(copyPublicFolder);
  // In development we inject extra permissions to support hot reload.
  if (process.env.NODE_ENV === 'development') {
    copyDevManifest(appPaths);
  } else {
    copyProdManifest(appPaths);
  }
};

module.exports = () => {
  const appPaths = require('../../config/paths');
  const app = loadApp(appPaths);
  const bundles = [].concat(app, loadBundles(app));

  setupBuildDir(appPaths, bundles);
  return bundles.filter(p => p.indexJs);
};
