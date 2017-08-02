/* globals __resourceQuery, browser */
'use strict';

const isBackgroundOrOptionsScript = !!browser.runtime.getBackgroundPage;
if (isBackgroundOrOptionsScript) {
  const querystring = require('querystring');
  const serverUrl = querystring.parse(__resourceQuery.slice(1)).server_url;
  require('./client')(serverUrl);
}
