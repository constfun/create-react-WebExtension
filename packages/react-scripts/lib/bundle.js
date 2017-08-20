'use strict';

const fs = require('fs');
const path = require('path');
const find = require('find');
const chalk = require('chalk');
const checkRequiredFiles = require('react-dev-utils/checkRequiredFiles');

const existsOrNull = path => fs.existsSync(path) ? path : null;

const validIndexExts = ['ml', 'tsx', 'ts', 're', 'jsx', 'js']
const findIndexFile = bundlePath => {
  return (
    // From best option to only option.
    validIndexExts
      .map(ext => path.join(bundlePath, `index.${ext}`))
      .find(p => fs.existsSync(p)) || null
  );
};
const requireIndexFile = bundlePath => {
  const indexFile = findIndexFile(bundlePath);
  if (!indexFile) {
    // Warn and rash.
    const multiFilename = `index.{${validIndexExts.join(',')}}`;
    checkRequiredFiles([path.join(bundlePath, multiFilename)]);
    process.exit(1);
  }
  return indexFile;
};

// Any directory that has an empty _bundle file in it will be compiled to
// a main.js, and an optional index.html and main.css.
const loadChildBundles = searchPath => {
  return find
    .fileSync(/\/_bundle$/, searchPath)
    .filter(file => path.dirname(file) !== searchPath)
    .map(bundleFile => loadOneChildBundle(searchPath, bundleFile));
};

const loadOneChildBundle = (searchPath, bundleFile) => {
  const bundlePath = path.dirname(bundleFile);
  const bundleName = bundlePath
    .substr(searchPath.length + 1)
    .replace(new RegExp(path.sep, 'g'), '-');

  const bundle = {
    bundleName,
    bundlePath,
    // Bundles may contain an index.html template.
    indexHtml: existsOrNull(path.join(bundlePath, 'index.html')),
    // A bundle must have an entry point.
    indexJs: requireIndexFile(bundlePath),
  };

  return Object.freeze(bundle);
};

const loadAppBundle = appPaths => {
  // We place the app's index.html file under src for consistency with bundles.
  // Bundles have their index.html file right in the bundle folder in src,
  // so it would be odd for this one html file to exist outside of src.
  // However, this may catch CRA users off guard. So tell and fail.
  const craHtml = path.join(appPaths.appPublic, 'index.html');
  if (fs.existsSync(craHtml)) {
    console.log(
      chalk.red('Please move public/index.html file to src/index.html')
    );
    process.exit(1);
  }

  const bundle = {
    bundleName: 'index',
    // The app is treated just like any other bundle.
    bundlePath: path.dirname(appPaths.dotenv),
    // May have an index html. This is a deviation from CRA where it is required.
    // An extension without any html at all makes sense.
    indexHtml: existsOrNull(appPaths.appHtml),
    // An extension with just bundles and no root app makes sense.
    // Hence, we don't actually require an index file, but we'll build it if its there.
    indexJs: findIndexFile(appPaths.appSrc),
  };

  return Object.freeze(bundle);
};

const loadBundles = appPaths => {
  const appBundle = loadAppBundle(appPaths);
  return [].concat(appBundle, loadChildBundles(appPaths.appSrc));
};

module.exports = {
  loadChildBundles,
  loadAppBundle,
  loadBundles,
};
