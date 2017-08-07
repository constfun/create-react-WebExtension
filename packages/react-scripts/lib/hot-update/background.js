/* global browser chrome msBrowser */
'use strict';

const cross = browser || chrome || msBrowser;

// Install script, on behalf of the sending content script.
cross.runtime.onMessage.addListener(({ file }, sender) => {
  // TODO: Check that sender is part of this extension.
  cross.tabs.executeScript(sender.tab.id, { file });
  return true;
});
