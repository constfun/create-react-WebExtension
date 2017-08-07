/* global browser chrome msBrowser */
'use strict';

const crossb = browser || chrome || msBrowser;

// Install script, on behalf of the sending content script.
crossb.runtime.onMessage.addListener((msg, sender) => {
  // If the message is not from this extension, ignore it.
  if (!msg || sender.id !== crossb.runtime.id) {
    return;
  }

  if (msg.action !== '__hot-update') {
    return;
  }

  crossb.tabs.executeScript(sender.tab.id, { file: msg.file });
  return true;
});
