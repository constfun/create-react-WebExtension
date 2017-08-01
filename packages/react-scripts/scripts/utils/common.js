'use strict';

const fs = require('fs-extra');
const path = require('path');
const paths = require('../../config/paths');

const copyPublicFolder = () => {
  fs.copySync(paths.appPublic, paths.appBuild, {
    dereference: true,
    filter: file => file !== paths.appHtml,
  });

  if (process.env.NODE_ENV === 'development') {
    const input = path.join(paths.appPublic, 'manifest.json');
    const output = path.join(paths.appBuild, 'manifest.json');
    const manifest = require(input);
    fs.writeFile(
      output,
      JSON.stringify(injectDevServerPermissions(manifest), null, 2)
    );
  }
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

const setupBuildDir = () => {
  // We needs the files on disk for installing a temporary extension.
  fs.emptyDirSync(paths.appBuild);
  // Merge with the public folder
  copyPublicFolder();
};

module.exports = {
  setupBuildDir,
  copyPublicFolder,
};
