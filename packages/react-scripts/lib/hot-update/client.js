'use strict';

const stripAnsi = require('strip-ansi');
const formatWebpackMessages = require('react-dev-utils/formatWebpackMessages');

const crossb = window.chrome || window.browser || window.msBrowser;
const port = crossb.runtime.connect({ name: 'hot-update-port' });
const loadedModules = new Set();

// The port disconnects when our extension (our background runtime, to be exact) reloads.
// When this happens we reload the page to clear any stale content scripts.
// We only do this if the port connection was ever successfull, otherwise we'll start an infinite reload loop for content scripts that are automatically injected.
// let shouldReloadOnDisconnect = false;
// crossb.runtime.onConnect.addListener((connectedPort) => {
//   debugger
//   if (connectedPort === port) {
//     console.log('Connected to hot reload background runtime.');
//     shouldReloadOnDisconnect = true;
//   }
// });
// port.onDisconnect.addListener(() => {
//   if (shouldReloadOnDisconnect) {
//     window.location.reload();
//   }
// });

port.onMessage.addListener(portMessage => {
  // We only care about messages proxied from webpack-hot-middleware.
  if (portMessage.action !== 'receive-hot-message') {
    return true;
  }

  const hotMessage = portMessage.hotMessage;
  switch (hotMessage.action) {
    case 'sync':
      loadedModules.add(hotMessage.hash);
      break;
    case 'built':
      handleBuilt(hotMessage);
      break;
  }

  return true;
});

const handleBuilt = message => {
  if (loadedModules.has(message.hash)) {
    return;
  }

  if (message.errors.length) {
    printErrors(message.errors);
    return;
  }

  if (module.hot.status() === 'idle') {
    module.hot.check(true).catch(reloadExtension);
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

const reloadExtension = () => {
  crossb.runtime.sendMessage({ action: 'reload-extension' });
};
