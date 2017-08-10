/* globals browser */
const ml = require('./flavor/someml');
const ts = require('./content/somets');

browser.browserAction.onClicked.addListener(e => {
  browser.tabs.query({ active: true, currentWindow: true }).then(tabs => {
    console.log('Some ocaml value:', ml.value());
    console.log('Some ts value', ts.value());
    browser.tabs.sendMessage(tabs[0].id, 'make-a-donut');
  });
});
