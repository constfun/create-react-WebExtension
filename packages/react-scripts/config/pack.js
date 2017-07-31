'use strict';

const path = require('path');
const paths = require('./paths');

const findAll = dir => require('find').fileSync(/\.pack/, dir);
const name = pack => path.basename(dir(pack));
const dir = pack => path.dirname(pack);
const servedPath = pack => path.join(paths.servedPath, name(pack));
const contextPath = pack => path.join(paths.appPath, dir(pack));
const buildPath = pack => path.join(paths.appBuild, name(pack));

module.exports = {
  findAll,
  name,
  dir,
  servedPath,
  contextPath,
  buildPath,
};
