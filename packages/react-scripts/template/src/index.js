// This script is specified as this WebExtension's background script in public/manifest.json
// https://developer.mozilla.org/en-US/Add-ons/WebExtensions/manifest.json/background

// When the user clicks our browserAction button in the toolbar,
// we programatically inject a script into the currently active tab.
// https://developer.mozilla.org/en-US/Add-ons/WebExtensions/API/browserAction
// https://developer.mozilla.org/en-US/Add-ons/WebExtensions/Modify_a_web_page
browser.browserAction.onClicked.addListener(_ => {
  // For a smoother experience between Chrome and Firefox we introduce a polyfill for Chrome.
  // Firefox WebExtension API is more modern (standard?) and uses Promises instead of callbacks.
  // The entire public/ directory is coppied into the build/ without modification.
  // If you don't want the polyfill, you can delete the public/js/browser-polyfill.js file.
  // See https://github.com/mozilla/webextension-polyfill for usage instructions.
  browser.tabs.executeScript({ file: 'js/browser-polyfill.js' });
  // The presense of an empty src/guide/_bundle file signals Create React WebExtension that
  // separate build/js/guide.js bundle should be created from the containing directory. With
  // src/guide/index.[js|ts|ml|re] used as the entry point.
  // See README.md for more details.
  browser.tabs.executeScript({ file: 'js/test.js' });
  browser.tabs.executeScript({ file: 'js/typescript-example.js' });
  browser.tabs.executeScript({ file: 'js/ocaml-example.js' });
  browser.tabs.executeScript({ file: 'js/guide.js' });
});
