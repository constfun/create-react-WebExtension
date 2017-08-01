'use strict';

// Build pack.

const fs = require('fs');
const path = require('path');
const find = require('find');
const chalk = require('chalk');
const checkRequiredFiles = require('react-dev-utils/checkRequiredFiles');

// opts: {
//   servedPath,
//   buildPath,
// }
const loadPacks = app => {
  const searchPath = path.join(app.contextPath, 'src');
  return find
    .fileSync(/\/_pack$/, searchPath)
    .filter(packFile => path.dirname(packFile) !== searchPath)
    .map(packFile => loadOnePack(app, packFile));
};

const loadOnePack = (app, packFile) => {
  const packPath = path.dirname(packFile);
  const packName = path.basename(packPath);

  const paths = {
    shouldBuild: true,
    // Packs are always served from [servedPath]/packs/packName.
    servedPath: path.join(app.servedPath, 'packs', packName),
    // Packs are built into a flat namespace under [buildPath]/packs/.
    buildPath: path.join(app.buildPath, 'packs', packName),
  };
  const publicPath = path.join(packPath, 'public');
  // If there is a public sub-directory, treat the pack as if it was an entire create-react-app.
  if (fs.existsSync(publicPath) && fs.lstatSync(publicPath).isDirectory()) {
    Object.assign(paths, {
      // Where are entry points and loaders resolved from?
      // This might have other side-effects in webpack, and is recommended that it is set.
      contextPath: packPath,
      // *Must* have its own public dir.
      publicPath,
      // *Must* have an index html in public dir.
      indexHtml: path.join(publicPath, 'index.html'),
      // *Must* have an index tsx file in public dir.
      indexJs: path.join(packPath, 'src/index.tsx'),
    });

    // Warn and crash if required files are missing for the pack.
    if (!checkRequiredFiles([paths.indexHtml, paths.indexJs])) {
      process.exit(1);
    }
  } else {
    // If there is no public sub-directory treat the pack as if it was an app
    // containing only src directory with an indexJs and no public files.
    throw false; // assert
  }

  return Object.freeze(paths);
};

const loadApp = paths => {
  const shouldBuild =
    fs.existsSync(paths.appHtml) || fs.existsSync(paths.appIndexJs);
  if (!shouldBuild) {
    console.log(
      chalk.yellow(
        'Skipping building of the top level app since neither of the following files exists.\n' +
          'Note that the public folder is still coppied.\n'
      ) +
        `\t${paths.appHtml}\n` +
        `\t${paths.appIndexJs}\n`
    );
  } else {
    // Warn and crash if required files are missing for the app.
    if (!checkRequiredFiles([paths.appHtml, paths.appIndexJs])) {
      process.exit(1);
    }
  }

  return Object.freeze({
    shouldBuild,
    servedPath: paths.servedPath,
    buildPath: paths.appBuild,
    contextPath: path.dirname(paths.dotenv),
    publicPath: paths.appPublic,
    indexHtml: paths.appHtml,
    indexJs: paths.appIndexJs,
  });
};

// const name = pack => path.basename(dir(pack));
// const dir = pack => path.dirname(pack);
// const servedPath = pack => path.join(paths.servedPath, name(pack));
// const contextPath = pack => path.join(paths.appPath, dir(pack));
// const publicPath = pack => path.join(contextPath(pack), 'public');
// const buildPath = pack => path.join(paths.appBuild, name(pack));
// const indexHtml = pack => {
//   const indexFile = path.join(publicPath(pack), 'index.html');
//   if (fs.existsSync(indexFile)) {
//     return indexFile;
//   } else {
//     return null;
//   }
// };
// const indexJs = () => './src/index.tsx';

module.exports = {
  loadPacks,
  loadApp,
};
