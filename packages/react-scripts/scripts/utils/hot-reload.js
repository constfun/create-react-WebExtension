/* globals browser */
'use strict';

const url = require('url');
const hotMiddleware = require('webpack-hot-middleware');

const PATH = '/__hot-reload';

const makeServer = (compiler, opts = {}) => {
  return hotMiddleware(
    compiler,
    Object.assign(
      {
        path: PATH,
        heartbeat: 10e3,
      },
      opts
    )
  );
};

const makeClient = address => {
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

  connection.onopen = () => {
    console.info('Connected to hot reload development server.');
  };

  connection.onclose = () => {
    console.info('Disconnected from hot reload development server.');
  };

  connection.onerror = () => {
    console.info('Connection to hot reload development server failed.');
  };

  return connection;
};

module.exports = {
  makeServer,
  makeClient,
};
