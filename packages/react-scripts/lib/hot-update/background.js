'use strict';

const crossb = window.browser || window.chrome || window.msBrowser;

// Install script, on behalf of the sending content script.
crossb.runtime.onMessage.addListener((msg, sender) => {
  // If the message is not from this extension, ignore it.
  if (!msg || sender.id !== crossb.runtime.id) {
    return true;
  }

  if (msg.action === '__hot-update-apply') {
    crossb.tabs.executeScript(sender.tab.id, { file: msg.file });
  } else if (msg.action === '__hot-update-reload') {
    crossb.runtime.reload();
  }

  return true;
});

console.log("I'm a background script.");
