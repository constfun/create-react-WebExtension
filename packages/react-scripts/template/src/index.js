/* globals browser */
const ml = require('./flavor/someml');
const ts = require('./content/somets');

browser.browserAction.onClicked.addListener(e => {
  browser.tabs.query({ active: true, currentWindow: true }).then(tabs => {
    console.log('Soem:', ml.value());
    console.log('Sxatss', ts.value());
    browser.tabs.sendMessage(tabs[0].id, 'make-a-donut');
  });
});
