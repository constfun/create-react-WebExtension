'use strict';

const path = require('path');

const findAll = dir => require('find').fileSync(/\.pack/, dir);
const name = pack => path.basename(dir(pack));
const dir = pack => path.dirname(pack);

module.exports = {
  findAll,
  name,
  dir,
};
