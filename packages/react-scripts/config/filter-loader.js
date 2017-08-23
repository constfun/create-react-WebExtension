'use strict';

const { getOptions } = require('loader-utils');

module.exports = function loader(content) {
  if (this.data.failMessage) {
    this.emitError(new Error(this.data.failMessage));
    return '';
  } else {
    return content;
  }
};

module.exports.pitch = function(_1, _2, data) {
  const options = getOptions(this) || {};
  options.filterFn = options.filterFn || (() => {});
  options.failMessage =
    options.failMessage ||
    'Filter condition not met, skipping subsequent loaders.';

  if (options.filterFn(this)) {
    return;
  } else {
    data.failMessage = options.failMessage;
    this.loaders.splice(this.loaderIndex + 1);
  }
};
