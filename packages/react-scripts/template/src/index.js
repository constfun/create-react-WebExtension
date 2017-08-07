/* globals browser */

browser.browserAction.onClicked.addListener(e => {
  browser.tabs.query({ active: true, currentWindow: true }).then(tabs => {
    browser.tabs.sendMessage(tabs[0].id, 'make-a-donut');
  });
});

// Install script, on behalf of the sending content script.
browser.runtime.onMessage.addListener(({ file }, sender) => {
  // TODO: Check that sender is part of this extension.
  browser.tabs.executeScript(sender.tab.id, { file });
});
