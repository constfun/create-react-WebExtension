/* globals browser */
'use strict';

// const LockableStorage = require('lockable-storage');

const isBackgroundOrOptionsScript = !!browser.runtime.getBackgroundPage;
if (isBackgroundOrOptionsScript) {
  const url = require('url');
  const SockJS = require('sockjs-client');

  const connection = new SockJS(
    url.format({
      protocol: 'http:',
      hostname: 'localhost',
      port: '3000',
      // Hardcoded in WebpackDevServer
      pathname: '/sockjs-node',
    })
  );

  var lastHash = null;
  connection.onmessage = e => {
    const message = JSON.parse(e.data);
    if (message.type === 'hash') {
      if (!lastHash) {
        lastHash = message.data;
      }
      if (lastHash !== message.data) {
        browser.runtime.reload();
      }
    }
  };

  connection.onopen = () => {
    console.info('Connected to hot reload development server.');
  };

  connection.onclose = () => {
    console.info('The development server has disconnected.');
  };
}
