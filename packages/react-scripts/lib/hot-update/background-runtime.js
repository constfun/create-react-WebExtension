'use strict';

const crossb = window.browser || window.chrome || window.msBrowser;

const openPorts = [];
crossb.runtime.onConnect.addListener(port => {
  if (port.name !== '__hot-update') {
    return;
  }

  openPorts.push(port);
  port.onMessage.addListener(handleMessage);
});

// Install script, on behalf of the sending content script.
const handleMessage = (msg, { sender }) => {
  // If the message is not from this extension, ignore it.
  if (!msg || sender.id !== crossb.runtime.id) {
    return true;
  }

  if (msg.action === 'apply-update') {
    crossb.tabs.executeScript(sender.tab.id, { file: msg.file });
  } else if (msg.action === 'reload-extension') {
    window.__reload_extension();
  }

  return true;
};

window.__reload_extension = () => {
  crossb.runtime.reload();
  openPorts.map(port => port.postMessage({ action: 'reload-page' }));
};

window.__apply_hot_update = window.__reload_extension;
