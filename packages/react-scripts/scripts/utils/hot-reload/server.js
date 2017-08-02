'use strict';

const http = require('http');
const express = require('express');
const hotMiddleware = require('webpack-hot-middleware');
const { hotReloadUrl } = require('./_shared');

module.exports = (compiler, opts = {}) => {
  const app = express();
  app.use(
    hotMiddleware(
      compiler,
      Object.assign(
        {
          path: hotReloadUrl,
          heartbeat: 10e3,
        },
        opts
      )
    )
  );

  return http.createServer(app);
};
