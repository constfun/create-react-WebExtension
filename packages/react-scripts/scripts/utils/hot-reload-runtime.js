/* globals __resourceQuery, browser */
'use strict';

const isBackgroundOrOptionsScript = !!browser.runtime.getBackgroundPage;
if (isBackgroundOrOptionsScript) {
  const querystring = require('querystring');
  const server_url = querystring.parse(__resourceQuery.slice(1)).server_url;
  const { makeClient } = require('./hot-reload');
  makeClient(server_url);
}
