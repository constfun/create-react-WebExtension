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
const loadChildBundles = appBundle => {
  const searchPath = path.join(appBundle.bundlePath, 'src');
  return find
    .fileSync(/\/_bundle$/, searchPath)
    .filter(file => path.dirname(file) !== searchPath)
    .map(bundleFile => loadOneChildBundle(appBundle, bundleFile));
};

const loadOneChildBundle = (app, bundleFile) => {
  const bundlePath = path.dirname(bundleFile);
  const bundleName = path.basename(bundlePath);

  const bundle = {
    bundleName,
    bundlePath,
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

const loadAppBundle = appPaths => {
  const bundle = {
    bundleName: 'index',
    // The app is treated just like any other bundle.
    bundlePath: path.dirname(appPaths.dotenv),
    // May have an index html. This is a deviation from CRA where it is required.
    // We lift this restriction for consistency with "bundles" that can be just JavaScript.
    // Similarly we expect the index.html file to be in src root (this is change in paths.js),
    // again for consistency with bundles, which will have their html files somewhere under src.
    indexHtml: existsOrNull(appPaths.appHtml),
    // Pick from
    indexJs: selectIndexFile(appPaths.appSrc),
  };

  return Object.freeze(bundle);
};

const loadBundles = appPaths => {
  const appBundle = loadAppBundle(appPaths);
  return [].concat(appBundle, loadChildBundles(appBundle));
};

module.exports = {
  loadChildBundles,
  loadAppBundle,
  loadBundles,
};
