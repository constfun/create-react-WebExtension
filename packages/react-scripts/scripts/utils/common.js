'use strict';

const fs = require('fs-extra');
const path = require('path');
const Pack = require('../../config/pack');
const APP_PATHS = require('../../config/paths');

const copyPublicFolders = () => {
  const { appPublic, appBuild, appHtml } = APP_PATHS;
  // console.log(Pack.buildPath(pack), Pack.publicPath(pack));
  fs.copySync(appPublic, appBuild, {
    dereference: true,
    filter: file => file !== appHtml,
  });

  Pack.findAll('src').map(pack => {
    if (!fs.existsSync(Pack.publicPath(pack))) {
      return;
    }
    fs.copySync(Pack.publicPath(pack), Pack.buildPath(pack), {
      dereference: true,
      filter: file => file !== Pack.indexHtml(pack),
    });
  });
};

const manifestPaths = () => {
  const { appPublic, appBuild } = APP_PATHS;
  const manifestSrc = path.join(appPublic, 'manifest.json');
  const manifestDest = path.join(appBuild, 'manifest.json');
  return { manifestSrc, manifestDest };
};

const copyProdManifest = () => {
  const { manifestSrc, manifestDest } = manifestPaths();
  fs.copySync(manifestSrc, manifestDest);
};

const copyDevManifest = () => {
  if (process.env.NODE_ENV !== 'development') {
    throw 'Asked to copy development version of the manifest in a non-development environment.';
  }

  const { manifestSrc, manifestDest } = manifestPaths();
  const manifest = require(manifestSrc);
  fs.writeFile(
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

const setupBuildDir = () => {
  const { appBuild } = APP_PATHS;
  // We needs the files on disk for installing a temporary extension.
  fs.emptyDirSync(appBuild);
  // Merge with the public folder
  copyPublicFolders();

  if (process.env.NODE_ENV === 'development') {
    copyDevManifest();
  } else {
    copyProdManifest();
  }
};

module.exports = {
  setupBuildDir,
};
