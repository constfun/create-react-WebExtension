/*
  This script is bundled into the js/guide-background-script.js file because:
      - There is an empty _bundle file in this directory.
      - The current file is named 'index.js' making it the entry point for the bundle.
      - The bundle path becomes the bundle name.
        guide/background-script -> guide-background-script.js
*/

// An extremely simple polyfill that aliases the 'chrome' global to 'browser'.
// A more sophisticated polyfill is available at https://github.com/mozilla/webextension-polyfill
require('chrome-browser-object-polyfill');

browser.runtime.onInstalled.addListener((details) => {
  if (details.reason !== 'update') {
    browser.tabs.create({
      active: true,
      url: 'https://github.com/constfun/create-react-WebExtension/blob/master/packages/react-scripts/template/README.md',
    });
  }
});