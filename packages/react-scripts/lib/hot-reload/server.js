'use strict';

const http = require('http');
const express = require('express');
const hotMiddleware = require('webpack-hot-middleware');

module.exports = (compiler, hotMiddlewareOpts = {}) => {
  const app = express();
  const middleware = hotMiddleware(
    compiler,
    Object.assign(
      {
        // HARDCODED in client.js
        path: '/__web_ext_hot_reload',
        heartbeat: 10e3,
      },
      hotMiddlewareOpts
    )
  );
  app.use(middleware);
  const server = http.createServer(app);
  server.force = () => middleware.publish({ action: 'force' });
  return server;
};
