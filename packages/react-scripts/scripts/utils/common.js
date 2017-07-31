'use strict';

const fs = require('fs-extra');
const paths = require('../../config/paths').getPaths();

const copyPublicFolder = () => {
  fs.copySync(paths.appPublic, paths.appBuild, {
    dereference: true,
    filter: file => file !== paths.appHtml,
  });
};

const setupBuildDir = () => {
  // We needs the files on disk for installing a temporary extension.
  fs.emptyDirSync(paths.appBuild);
  // Merge with the public folder
  copyPublicFolder();
};

module.exports = {
  setupBuildDir,
};
