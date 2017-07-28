'use strict';

const path = require('path');

const findAll = dir => require('find').fileSync(/\.pack/, dir);
const dir = pack => path.dirname(pack);

module.exports = {
  findAll,
  dir,
};
