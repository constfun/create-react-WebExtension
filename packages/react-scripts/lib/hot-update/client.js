/* globals __resourceQuery */
'use strict';

const url = require('url');
const stripAnsi = require('strip-ansi');
const formatWebpackMessages = require('react-dev-utils/formatWebpackMessages');
var querystring = require('querystring');

const makeClient = (
  hotUpdateServerUrl,
  reloadExtension = window.__reload_extension
) => {
  let _connectionFailureReported = false;
  const loadedHashes = new Set();

  // HARDCddODED in server.js
  const connection = new window.EventSource(
    url.resolve(hotUpdateServerUrl, '/__web_ext_hot_reload')
  );

  connection.onmessage = e => {
    // This is heart emoji... wish it was action === 'heartbeat'.
    // Crash and burn and sometimes even work, cutely.
    if (e.data == '\uD83D\uDC93') {
      return;
    }

    const message = JSON.parse(e.data);
    switch (message.action) {
      case 'sync':
        loadedHashes.add(message.hash);
        break;
      case 'built':
        handleBuilt(message);
        break;
      case 'force':
        reloadExtension();
        break;
    }
  };

  connection.onopen = () => {
    console.info('Connected to hot reload development server.');
    _connectionFailureReported = false;
  };

  connection.onclose = () => {
    console.info('Disconnected from hot reload development server.');
    _connectionFailureReported = false;
  };

  connection.onerror = () => {
    if (_connectionFailureReported) {
      return;
    }
    console.info(
      'Connection to hot reload development list, attempting to reconnect...'
    );
    _connectionFailureReported = true;
  };

  const handleBuilt = message => {
    if (loadedHashes.has(message.hash)) {
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

  return connection;
};

const crossb = window.browser || window.chrome || window.msBrowser;
var IS_BACKGROUND = !!crossb.extension.getBackgroundPage;
if (IS_BACKGROUND) {
  require('./background-runtime');
} else {
  require('./content-runtime');
}

makeClient(querystring.parse(__resourceQuery.slice(1)).hotUpdateServerUrl);
