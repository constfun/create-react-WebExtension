/* globals browser */

import { hello } from './other';

const thing = require('./donut2.svg');

console.log(hello, 'and thisx');

browser.browserAction.onClicked.addListener(e => {
  browser.tabs.query({ active: true, currentWindow: true }).then(tabs => {
    browser.tabs.sendMessage(tabs[0].id, {}, () => {});
  });
});
