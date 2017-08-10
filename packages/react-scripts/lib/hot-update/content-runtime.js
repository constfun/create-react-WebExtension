'use strict';

const crossb = window.browser || window.chrome || window.msBrowser;

const conn = crossb.runtime.connect({ name: '__hot-update' });
conn.onMessage.addListener(msg => {
  if (msg.action === 'reload-page') {
    window.location.reload();
  }
});

window.__apply_hot_update = file => {
  conn.postMessage({ action: 'apply-update', file });
};

window.__reload_extension = () => {
  conn.postMessage({ action: 'reload-extension' });
};
