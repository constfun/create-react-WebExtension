'use strict';

const fs = require('fs');
const del = require('del');
const path = require('path');
const http = require('http');
const express = require('express');
const spdy = require('spdy');
const selfsigned = require('selfsigned');
const hotMiddleware = require('webpack-hot-middleware');

module.exports = (compiler, options = {}) => {
  const app = express();
  options.hotMiddlewareOpts = options.hotMiddlewareOpts || {};

  const middleware = hotMiddleware(
    compiler,
    Object.assign(
      {
        // HARDCODED in client.js
        path: '/__web_ext_hot_reload',
        heartbeat: 10e3,
      },
      options.hotMiddlewareOpts
    )
  );
  app.use(middleware);
  app.use(express.static(compiler.options.output.path));

  const server = createServer(app, options);
  server.force = () => middleware.publish({ action: 'force' });

  return server;
};

// Shamlessly stolen from webpack-dev-server.
const createServer = (app, options) => {
  if (!options.https) {
    return http.createServer(app);
  }

  if (typeof options.https === 'boolean') {
    options.https = {
      key: options.key,
      cert: options.cert,
      ca: options.ca,
      pfx: options.pfx,
      passphrase: options.pfxPassphrase,
    };
  }

  // Use a self-signed certificate if no certificate was configured.
  // Cycle certs every 24 hours
  const certPath = path.join(__dirname, './ssl/server.pem');
  let certExists = fs.existsSync(certPath);

  if (certExists) {
    const certStat = fs.statSync(certPath);
    const certTtl = 1000 * 60 * 60 * 24;
    const now = new Date();

    // cert is more than 30 days old, kill it with fire
    if ((now - certStat.ctime) / certTtl > 30) {
      console.log('SSL Certificate is more than 30 days old. Removing.');
      del.sync([certPath], { force: true });
      certExists = false;
    }
  }

  if (!certExists) {
    console.log('Generating SSL Certificate');
    const attrs = [{ name: 'commonName', value: 'localhost' }];
    const pems = selfsigned.generate(attrs, {
      algorithm: 'sha256',
      days: 30,
      keySize: 2048,
    });

    fs.writeFileSync(certPath, pems.private + pems.cert, { encoding: 'utf-8' });
  }

  const fakeCert = fs.readFileSync(certPath);
  options.https.key = options.https.key || fakeCert;
  options.https.cert = options.https.cert || fakeCert;

  if (!options.https.spdy) {
    options.https.spdy = {
      protocols: ['h2', 'http/1.1'],
    };
  }

  return spdy.createServer(options.https, app);
};
