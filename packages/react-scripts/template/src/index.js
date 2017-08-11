// Programatically inject a script when the user clicks our browserAction button in the toolbar.
// https://developer.mozilla.org/en-US/Add-ons/WebExtensions/Modify_a_web_page
// https://github.com/mozilla/webextension-polyfill
browser.browserAction.onClicked.addListener(_ => {
  browser.tabs.executeScript({ file: 'js/browser-polyfill.js' });
  browser.tabs.executeScript({ file: 'js/help.js' });
});

// browser.browserAction.setBadgeText({ text: '42' })
