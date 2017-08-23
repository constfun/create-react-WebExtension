/* global __webpack_require__, browser */
'use strict';

require('chrome-browser-object-polyfill');

const IS_BACKGROUND_SCRIPT = !!browser.extension.getBackgroundPage;
const __COMPILATION_HASH__ = __webpack_require__.h();

const stripAnsi = require('strip-ansi');
const formatWebpackMessages = require('react-dev-utils/formatWebpackMessages');

const handleMessage = (message, reloadExtension) => {
  switch (message.action) {
    case 'sync':
    case 'built':
      if (message.errors.length) {
        printErrors(message.errors);
        return;
      }

      if (
        message.hash !== __COMPILATION_HASH__ &&
        module.hot.status() === 'idle'
      ) {
        module.hot
          .check(true)
          .catch(reloadExtension);
      }
      break;
  }
};

const printErrors = errors => {
  var formatted = formatWebpackMessages({
    errors: errors,
    warnings: [],
  });

  if (typeof console !== 'undefined' && typeof console.error === 'function') {
    for (var i = 0; i < formatted.errors.length; i++) {
      console.error(stripAnsi(formatted.errors[i]));
    }
  }
};

if (IS_BACKGROUND_SCRIPT) {
  window.addEventListener('hot-update-message', e => {
    handleMessage(e.detail, () => browser.runtime.reload());
  }, false);
}
else {
  const handleDisconnect = () => {
    // The port disconnects when our extension reloads.
    // When this happens we reload the page to clear any stale content scripts.
    console.log('Hot update port closed. Reloading.');
    window.location.reload();
  };

  const reloadExtension = () => {
    browser.runtime.sendMessage({ action: 'reload-extension' });
  };

  const port = browser.runtime.connect({ name: 'hot-update-port' });
  port.onDisconnect.addListener(handleDisconnect);
  port.onMessage.addListener(message => {
    handleMessage(message, reloadExtension);
  });
}
