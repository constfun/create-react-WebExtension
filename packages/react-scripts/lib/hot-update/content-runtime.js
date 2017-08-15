'use strict';

const crossb = window.browser || window.chrome || window.msBrowser;

const port = crossb.runtime.connect({ name: '__hot-update' });
port.onDisconnect.addListener(() => window.location.reload());

window.__apply_hot_update = file => {
  port.postMessage({ action: 'apply-update', file });
};

window.__reload_extension = () => {
  port.postMessage({ action: 'reload-extension' });
};
