import 'chrome-browser-object-polyfill';

browser.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'update') {
    return;
  }

  browser.tabs.create({
    active: true,
    url: 'https://github.com/constfun/create-react-WebExtension/blob/master/packages/react-scripts/template/README.md',
  });
});