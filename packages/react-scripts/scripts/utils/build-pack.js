'use strict';

// Build pack.

const fs = require('fs');
const path = require('path');
const find = require('find');
// const chalk = require('chalk');
const checkRequiredFiles = require('react-dev-utils/checkRequiredFiles');

const existsOrNull = path => (fs.existsSync(path) ? path : null);

const selectIndexFile = packPath => {
  return (
    ['ml', 're', 'tsx', 'ts', 'jsx', 'js']
      .map(ext => path.join(packPath, `index.${ext}`))
      // .forEach(p => console.log(p))
      .find(p => fs.existsSync(p)) || null
  );
};

// opts: {
//   servedPath,
//   buildPath,
// }
const loadPacks = app => {
  const searchPath = path.join(app.packPath, 'src');
  return find
    .fileSync(/\/\.bundle$/, searchPath)
    .filter(packFile => path.dirname(packFile) !== searchPath)
    .map(packFile => loadOnePack(app, packFile));
};

const loadOnePack = (app, packFile) => {
  const packPath = path.dirname(packFile);
  const packName = path.basename(packPath);
  const publicPath = path.join(packPath, 'public');

  const bundle = {
    packPath,
    // Packs are always served from [servedPath]/packs/packName.
    servedPath: path.join(app.servedPath, 'bundles', packName) + '/',
    // Packs are built into a flat namespace under [buildPath]/packs/.
    buildPath: path.join(app.buildPath, 'bundles', packName),
    // May have its own public dir.
    publicPath: existsOrNull(publicPath),
    // May have an index html in public dir.
    indexHtml: existsOrNull(path.join(publicPath, 'index.html')),
    // Must have an index tsx file in pack dir.
    indexJs: selectIndexFile(packPath),
  };

  // Warn and crash if required files are missing for the pack.
  if (!checkRequiredFiles([bundle.indexJs])) {
    process.exit(1);
  }

  return Object.freeze(bundle);
};

const loadApp = paths => {
  return Object.freeze({
    packPath: path.dirname(paths.dotenv),
    servedPath: paths.servedPath,
    buildPath: paths.appBuild,
    publicPath: paths.appPublic,
    indexHtml: existsOrNull(paths.appHtml),
    indexJs: selectIndexFile(paths.appSrc),
  });
};

module.exports = {
  loadPacks,
  loadApp,
};
