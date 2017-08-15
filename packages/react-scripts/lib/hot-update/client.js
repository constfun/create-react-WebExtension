/* global __webpack_require__ */
'use strict';

const stripAnsi = require('strip-ansi');
const formatWebpackMessages = require('react-dev-utils/formatWebpackMessages');

const crossb = window.chrome || window.browser || window.msBrowser;
const IS_BACKGROUND_SCRIPT = !!crossb.extension.getBackgroundPage;

const currentHash = __webpack_require__.h;

let lastHash;
function upToDate(hash) {
  if (hash) lastHash = hash;
  return lastHash == currentHash();
}

const handleMessage = (message, reloadExtension) => {
  switch (message.action) {
    case 'sync':
    case 'built':
      if (message.errors.length) {
        printErrors(message.errors);
        return;
      }

      if (!upToDate(message.hash) && module.hot.status() === 'idle') {
        module.hot
          .check(true)
          .then(res => console.log(res))
          .catch(reloadExtension);
        // .then(
        //   res => console.log('up', res),
        //   res => console.log(res)
        // );
        // .then(res => {
        //   console.log('check ok', res);
        // },
        // (err) => {
        //   console.log('check err', err);
        // }
        // )
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
  window.addEventListener(
    'hot-update',
    e => {
      handleMessage(e.detail, () => crossb.runtime.reload());
    },
    false
  );
} else {
  const handleDisconnect = () => {
    // The port disconnects when our extension reloads.
    // When this happens we reload the page to clear any stale content scripts.
    console.log('Hot update port closed. Reloading.');
    window.location.reload();
  };

  const reloadExtension = () => {
    crossb.runtime.sendMessage({ action: 'reload-extension' });
  };

  const port = crossb.runtime.connect({ name: 'hot-update-port' });
  port.onMessage.addListener(message => {
    handleMessage(message, reloadExtension);
  });
  port.onDisconnect.addListener(handleDisconnect);
}
