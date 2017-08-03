'use strict';

const fs = require('fs');
const path = require('path');
const find = require('find');
const checkRequiredFiles = require('react-dev-utils/checkRequiredFiles');

const existsOrNull = path => (fs.existsSync(path) ? path : null);

const selectIndexFile = bundlePath => {
  return (
    // From best option to only option.
    ['ml', 'tsx', 'ts', 're', 'jsx', 'js']
      .map(ext => path.join(bundlePath, `index.${ext}`))
      .find(p => fs.existsSync(p)) || null
  );
};

// Any directory that has an empty _bundle file in it will be compiled to
// a main.js, and an optional index.html and main.css.
const loadBundles = app => {
  const searchPath = path.join(app.bundlePath, 'src');
  return find
    .fileSync(/\/_bundle$/, searchPath)
    .filter(file => path.dirname(file) !== searchPath)
    .map(bundleFile => loadOneBundle(app, bundleFile));
};

const loadOneBundle = (app, bundleFile) => {
  const bundlePath = path.dirname(bundleFile);
  const bundleName = path.basename(bundlePath);

  const bundle = {
    bundlePath,
    // Bundles are always served from '{app.servedPath}/bundles/{bundleName}/'.
    servedPath: path.join(app.servedPath, 'bundles', bundleName) + '/',
    // Bundles are built into a flat namespace under {app.buildPath}/bundles/.
    buildPath: path.join(app.buildPath, 'bundles', bundleName),
    // Bundles may contain an index.html template.
    indexHtml: existsOrNull(path.join(bundlePath, 'index.html')),
    // Entry points can be written in a number of languages.
    indexJs: selectIndexFile(bundlePath),
  };

  // Warn and crash if required files are missing.
  if (!checkRequiredFiles([bundle.indexJs])) {
    process.exit(1);
  }

  return Object.freeze(bundle);
};

const loadApp = appPaths => {
  const bundle = {
    // The app is treated just like any other bundle.
    bundlePath: path.dirname(appPaths.dotenv),
    servedPath: appPaths.servedPath,
    buildPath: appPaths.appBuild,
    // May have an index html. This is a deviation from CRA where it is required.
    // Bundles can be just JavaScript, no reason to put limits on the app.
    indexHtml: existsOrNull(appPaths.appHtml),
    // Pick from
    indexJs: selectIndexFile(appPaths.appSrc),
  };

  return Object.freeze(bundle);
};

module.exports = {
  loadBundles,
  loadApp,
};
