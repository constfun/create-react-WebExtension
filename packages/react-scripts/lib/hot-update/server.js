'use strict';

const url = require('url');
const http = require('http');
const express = require('express');
const hotMiddleware = require('webpack-hot-middleware');

module.exports = (compiler, options) => {
  const app = express();
  options.hotMiddlewareOpts = options.hotMiddlewareOpts || {};

  const middleware = hotMiddleware(
    compiler,
    Object.assign(
      {
        path: url.parse(options.hotUpdateUrl).pathname,
        heartbeat: 10e3,
      },
      options.hotMiddlewareOpts
    )
  );
  app.use(middleware);
  app.use(express.static(compiler.options.output.path));

  const server = http.createServer(app);
  server.force = () => middleware.publish({ action: 'force-reload' });

  return server;
};