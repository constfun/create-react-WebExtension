'use strict';

const fs = require('fs');
const path = require('path');
const find = require('find');
const chalk = require('chalk');
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
  // We support an index.html file in the public dir.
  // But for consistency with bundles, we also support placing it at src/index.html.
  // And again for consistency, we support not having it at all.
  const craHtml = existsOrNull(appPaths.appHtml);
  const srcHtml = existsOrNull(path.join(appPaths.appSrc, 'index.html'));
  // Do fail if both exist.
  if (craHtml && srcHtml) {
    console.log(
      chalk.red(
        'Both public/index.html and src/index.html exist.\n' +
          'They would overwrite each other in the build directory.'
      )
    );
    process.exit(1);
  }

  const bundle = {
    bundleName: 'index',
    // The app is treated just like any other bundle.
    bundlePath: path.dirname(appPaths.dotenv),
    // May have an index html. This is a deviation from CRA where it is required.
    indexHtml: srcHtml || craHtml,
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
