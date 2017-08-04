/* globals __resourceQuery, browser */
'use strict';

const makeClient = address => {
  const url = require('url');
  const stripAnsi = require('strip-ansi');
  const formatWebpackMessages = require('react-dev-utils/formatWebpackMessages');

  let _connectionFailureReported = false;
  const loadedHashes = new Set();

  // HARDCODED in hotReloadServer.js
  const hotReloadPath = '/__web_ext_hot_reload';
  const connection = new window.EventSource(
    url.resolve(address, hotReloadPath)
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
        browser.runtime.reload();
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
  const serverUrl = querystring.parse(__resourceQuery.slice(1)).server_url;
  makeClient(serverUrl);
}
