/* globals browser */

import { hello } from './other';

console.log(hello, 'and thisx');

browser.browserAction.onClicked.addListener(e => {
  browser.tabs.query({ active: true, currentWindow: true }).then(tabs => {
    browser.tabs.sendMessage(tabs[0].id, {}, () => {});
  });
});
