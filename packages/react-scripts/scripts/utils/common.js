'use strict';

const fs = require('fs-extra');

const copyPublicFolder = paths => {
  fs.copySync(paths.appPublic, paths.appBuild, {
    dereference: true,
    filter: file => file !== paths.appHtml,
  });
};

const setupBuildDir = paths => {
  // We needs the files on disk for installing a temporary extension.
  fs.emptyDirSync(paths.appBuild);
  // Merge with the public folder
  copyPublicFolder(paths);
};

module.exports = {
  setupBuildDir,
  copyPublicFolder,
};
