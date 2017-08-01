'use strict';

const fs = require('fs');
const path = require('path');
const paths = require('./paths');
const find = require('find');

const findAll = dir => find.fileSync(/\.pack/, dir);
const name = pack => path.basename(dir(pack));
const dir = pack => path.dirname(pack);
const servedPath = pack => path.join(paths.servedPath, name(pack));
const contextPath = pack => path.join(paths.appPath, dir(pack));
const buildPath = pack => path.join(paths.appBuild, name(pack));
const indexHtml = pack => {
  const indexFile = path.join(contextPath(pack), 'public/index.html');
  if (fs.existsSync(indexFile)) {
    return indexFile;
  } else {
    return null;
  }
};
const indexJs = () => './src/index.tsx';

module.exports = {
  findAll,
  name,
  dir,
  servedPath,
  contextPath,
  buildPath,
  indexHtml,
  indexJs,
};
