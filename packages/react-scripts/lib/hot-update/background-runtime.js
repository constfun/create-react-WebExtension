// This script is automatically added as a "background script" into manifest.json, only in development.
// hotUpdateUrl is injected by processPublicFolder during setup.

/* global hotUpdateUrl */
'use strict';

const crossb = window.chrome || window.browser || window.msBrowser;

const hotConnection = new window.EventSource(hotUpdateUrl);

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
  const hotMessage = JSON.parse(e.data);
  if (hotMessage.action === 'force') {
    crossb.runtime.reload();
  }

  // Broadcast to all connected scripts.
  connectedPorts.forEach(port =>
    port.postMessage({
      action: 'receive-hot-message',
      hotMessage,
    })
  );
};

let connectionFailureHasBeenReported = false;

hotConnection.onopen = () => {
  console.info('Connected to hot reload development server.');
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
    crossb.tabs.executeScript(sender.tab.id, { file: message.file });
  } else if (message.action === 'reload-extension') {
    crossb.runtime.reload();
  } else if (message.action === 'download-hot-update-manifest') {
    downloadHotUpdateManifest(message.requestPath, message.requestTimeout).then(
      val => sendResponse({ resolveVal: val }),
      val => sendResponse({ rejectVal: val })
    );
    return true; // Signal async response.
  }
});

// Cut from JsonpMainTemplate.runtime since its running in a host page and possibly cannot connect due to Content Securit Policy.
const downloadHotUpdateManifest = (requestPath, requestTimeout) => {
  requestTimeout = requestTimeout || 10000;
  return new Promise(function(resolve, reject) {
    if (typeof XMLHttpRequest === 'undefined')
      return reject(new Error('No browser support'));
    try {
      var request = new XMLHttpRequest();
      request.open('GET', requestPath, true);
      request.timeout = requestTimeout;
      request.send(null);
    } catch (err) {
      return reject(err);
    }
    request.onreadystatechange = function() {
      if (request.readyState !== 4) return;
      if (request.status === 0) {
        // timeout
        reject(new Error('Manifest request to ' + requestPath + ' timed out.'));
      } else if (request.status === 404) {
        // no update available
        resolve();
      } else if (request.status !== 200 && request.status !== 304) {
        // other failure
        reject(new Error('Manifest request to ' + requestPath + ' failed.'));
      } else {
        // success
        try {
          var update = JSON.parse(request.responseText);
        } catch (e) {
          reject(e);
          return;
        }
        resolve(update);
      }
    };
  });
};
