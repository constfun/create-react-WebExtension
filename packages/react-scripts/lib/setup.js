'use strict';

const fs = require('fs-extra');
const { loadBundles } = require('./bundle');

const copyPublicFolder = appPaths => {
  fs.copySync(appPaths.appPublic, appPaths.appBuild, {
    dereference: true,
  });
};

const setupBuild = () => {
  const appPaths = require('../config/paths');

  fs.emptyDirSync(appPaths.appBuild);
  copyPublicFolder(appPaths);

  return loadBundles(appPaths);
};

module.exports = {
  setupBuild,
  copyPublicFolder,
};
