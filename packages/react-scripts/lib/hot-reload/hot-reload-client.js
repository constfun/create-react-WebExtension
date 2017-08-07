/* globals __resourceQuery, browser, __webpack_hash__ */
'use strict';

const makeClient = address => {
  const SockJS = require('sockjs-client');
  const url = require('url');
  const stripAnsi = require('strip-ansi');
  const formatWebpackMessages = require('react-dev-utils/formatWebpackMessages');

  var isFirstCompilation = true;
  var mostRecentCompilationHash = null;
  let _connectionFailureReported = false;
  const loadedHashes = new Set();

  // Is there a newer version of this code available?
  function isUpdateAvailable() {
    /* globals __webpack_hash__ */
    // __webpack_hash__ is the hash of the current compilation.
    // It's a global variable injected by Webpack.
    return mostRecentCompilationHash !== __webpack_hash__;
  }

  const connection = new SockJS(
    // Hardcoded in WebpackDevServer
    url.resolve(address, '/sockjs-node')
  );

  connection.onmessage = e => {
    var message = JSON.parse(e.data);
    console.log(message);
    switch (message.type) {
      case 'hash':
        mostRecentCompilationHash = message.data;
        break;
      case 'still-ok':
      case 'ok':
        handleSuccess();
        break;
      //   case 'content-changed':
      //     // Triggered when a file from `contentBase` changed.
      //     window.location.reload();
      //     break;
      //   case 'warnings':
      //     handleWarnings(message.data);
      //     break;
      //   case 'errors':
      //     handleErrors(message.data);
      //     break;
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
    console.info('Connection to hot reload development server failed.');
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

    browser.runtime.reload();
  };

  const printErrors = errors => {
    var formatted = formatWebpackMessages({
      errors: errors,
      warnings: [],
    });

    // Also log them to the console.
    if (typeof console !== 'undefined' && typeof console.error === 'function') {
      for (var i = 0; i < formatted.errors.length; i++) {
        console.error(stripAnsi(formatted.errors[i]));
      }
    }
  };

  return connection;
};

const isBackgroundOrOptionsScript = !!browser.runtime.getBackgroundPage;
if (isBackgroundOrOptionsScript) {
  const querystring = require('querystring');
  const serverUrl = querystring.parse(__resourceQuery.slice(1))
    .hotUpdateServerUrl;
  makeClient(serverUrl);
}
