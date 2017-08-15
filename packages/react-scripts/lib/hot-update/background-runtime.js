// WARNING! In development, this script is automatically added as a "background script" in manifest.json.

'use strict';

const downloadHotUpdateManifest = require('./download-manifest');

const crossb = window.chrome || window.browser || window.msBrowser;
const hotConnection = new window.EventSource(process.env.HOT_UPDATE_URL);
let connectionFailureHasBeenReported = false;
let reloadOnNextBuild = false;

// All bundled scripts connect to this runtime to receive messages from webpack-hot-middleware.
// For content scripts this is especially necessary to circumvent the Content Security Policy of the host page.
// Also, unlike in content scripts that are injected into HTTPS pages, here we can open an HTTP connection.
const connectedPorts = new Set([]);
crossb.runtime.onConnect.addListener(port => {
  if (port.name !== 'hot-update-port') {
    return;
  }
  connectedPorts.add(port);
  port.onDisconnect.addListener(port => connectedPorts.delete(port));
});

hotConnection.onmessage = e => {
  // This is heart emoji... or 'heartbeat' from webpack-hot-middleware.
  if (e.data == '\uD83D\uDC93') {
    return;
  }
  const message = JSON.parse(e.data);
  console.log(message);
  if (message.action === 'force-reload') {
    console.log('Received force reload message. Reloading extension.');
    crossb.runtime.reload();
  }

  if (
    reloadOnNextBuild &&
    (message.action === 'built' || message.action === 'sync')
  ) {
    console.log('Development server restarted. Reloading extension.');
    crossb.runtime.reload();
  }

  // Broadcast to all connected content scripts.
  connectedPorts.forEach(port => port.postMessage(message));

  // Broadcast to all connected background scripts.
  const hotEvent = new CustomEvent('hot-update', { detail: message });
  window.dispatchEvent(hotEvent);
};

hotConnection.onopen = () => {
  console.info('Connected to hot reload development server.');
  reloadOnNextBuild = connectionFailureHasBeenReported;
  connectionFailureHasBeenReported = false;
};

hotConnection.onclose = () => {
  console.info('Disconnected from hot reload development server.');
  connectionFailureHasBeenReported = false;
};

hotConnection.onerror = () => {
  if (connectionFailureHasBeenReported) {
    return;
  }
  console.info(
    'Connection to hot update development server lost.\n' +
      'You might see network errors in the console while we are attempting to reconnect.\n' +
      "If these become a nuisance, apply a filter in your browser's console."
  );
  connectionFailureHasBeenReported = true;
};

// We also provice a service for content scripts to download hot updates.
// These requests can be blocked by Content Security Policy of the content script's host page.
// And, a service for injecting hot updates into the host page on the behalf of a content script.
// Simply injecting a <script> into the host page will not work, since the content script is sandboxed.
// And, finally, a way for a content script update to trigger an extension reload.

crossb.runtime.onMessage.addListener(function(message, sender, sendResponse) {
  // If the message is not from this extension, ignore it.
  if (!message || sender.id !== crossb.runtime.id) {
    return;
  }

  // Install script, on behalf of the sending content script.
  // TODO: Behavior is undefined if the message comes from a background script.
  if (message.action === 'apply-hot-update') {
    console.log('Apply hot update', message.file);
    crossb.tabs.executeScript(sender.tab.id, { file: message.file });
  } else if (message.action === 'reload-extension') {
    console.log('Reloading extension, sender url', sender.url);
    crossb.runtime.reload();
  } else if (message.action === 'download-hot-update-manifest') {
    console.log('Downloading hot update manifest', message.requestPath);
    downloadHotUpdateManifest(message.requestPath, message.requestTimeout).then(
      val => sendResponse({ resolveVal: val }),
      val => sendResponse({ rejectVal: val })
    );
    return true; // Signal async response.
  }
});
