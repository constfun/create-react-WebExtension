// WARNING! In development, this script is automatically added as a "background script" in manifest.json.
'use strict';

const browser = window.chrome || window.browser || window.msBrowser;
let connectionFailureHasBeenReported = false;
let devServerRestarted = false;


// All content scripts connect to this port to receive messages from webpack-hot-middleware.
// We do this to circumvent the Content Security Policy of the host page.
const connectedPorts = new Set([]);
browser.runtime.onConnect.addListener(port => {
  if (port.name !== 'hot-update-port') {
    return;
  }
  connectedPorts.add(port);
  port.onDisconnect.addListener(port => connectedPorts.delete(port));
});

// Unlike content scripts we can open a plain HTTP (as opposed to HTTPS) connection.
const eventSource = new window.EventSource(process.env.HOT_UPDATE_URL);
eventSource.onmessage = e => {
  // This is 'heartbeat' emoji from webpack-hot-middleware...
  if (e.data == '\uD83D\uDC93') {
    return;
  }

  const message = JSON.parse(e.data);
  if (message.action === 'force-reload') {
    browser.runtime.reload();
  }
  else if (
    devServerRestarted &&
    (message.action === 'built' || message.action === 'sync')
  ) {
    console.log('Development server restarted. Reloading extension.');
    browser.runtime.reload();
  }

  // Broadcast to all connected content scripts.
  connectedPorts.forEach(port => port.postMessage(message));

  // Broadcast to all connected background scripts.
  const hotEvent = new CustomEvent('hot-update-message', { detail: message });
  window.dispatchEvent(hotEvent);
};

eventSource.onopen = () => {
  console.log('Connected to hot reload development server.');
  devServerRestarted = connectionFailureHasBeenReported;
  connectionFailureHasBeenReported = false;
};

eventSource.onclose = () => {
  console.log('Disconnected from hot reload development server.');
  connectionFailureHasBeenReported = false;
};

eventSource.onerror = () => {
  if (connectionFailureHasBeenReported) {
    return;
  }
  console.log( 'Connection to hot update development server lost.');
  console.log(
      'You might see network errors in the console while we are attempting to reconnect.\n' +
      "If these become a nuisance, apply a filter in your browser's console."
  );
  connectionFailureHasBeenReported = true;
};

// We also provide a service for content scripts to fetch hot updates.
// Content Security Policy of the content script's host page can block these connections.
// And, a service for injecting hot updates into the host page on the behalf of a content script.
// Simply injecting a <script> into the host page will not work, since the content script is sandboxed.
// And, finally, a way for a rejected hot update of a content script to trigger an extension reload.
browser.runtime.onMessage.addListener(function(message, sender, sendResponse) {
  // If the message is not from this extension, ignore it.
  if (!message || sender.id !== browser.runtime.id) {
    return;
  }

  if (message.action === 'execute-script') {
    // Install script, on behalf of the sending content script.
    browser.tabs.executeScript(sender.tab.id, { file: message.file });
  }
  else if (message.action === 'reload-extension') {
    browser.runtime.reload();
  }
  else if (message.action === 'fetch-hot-update-manifest') {
    fetch(message.requestPath)
      .then(resp => {
        switch (resp.status) {
          case 404:
            return sendResponse({ noUpdates: true });
          case 200:
          case 304:
            return resp.json()
              .then(json => sendResponse({ json }));
          default:
            sendResponse({err: resp});
        }
      });
    return true; // Signal async response.
  }
});
