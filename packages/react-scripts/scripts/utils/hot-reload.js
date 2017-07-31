/* globals browser */
'use strict';

const PATH = '/__hot-reload';

const makeServer = (compiler, opts = {}) => {
  const http = require('http');
  const express = require('express');
  const hotMiddleware = require('webpack-hot-middleware');

  const app = express();
  app.use(
    hotMiddleware(
      compiler,
      Object.assign(
        {
          path: PATH,
          heartbeat: 10e3,
        },
        opts
      )
    )
  );

  return http.createServer(app);
};

const makeClient = address => {
  const url = require('url');

  const loadedHashes = new Set();
  console.log(address);
  const connection = new window.EventSource(url.resolve(address, PATH));

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
        if (!loadedHashes.has(message.hash)) {
          browser.runtime.reload();
        }
        break;
      default:
    }
  };

  let _connectionFailureReported = false;

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

  return connection;
};

module.exports = {
  makeServer,
  makeClient,
};
