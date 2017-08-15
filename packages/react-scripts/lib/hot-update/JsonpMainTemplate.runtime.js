/* globals hotAddUpdateChunk parentHotUpdateCallback downloadManifest $require$ $hotChunkFilename$ $hotUpdateManifestUrl$ */
'use strict';

module.exports = function() {
  // eslint-disable-next-line no-unused-vars
  function webpackHotUpdateCallback(chunkId, moreModules) {
    hotAddUpdateChunk(chunkId, moreModules);
    if (parentHotUpdateCallback) parentHotUpdateCallback(chunkId, moreModules);
  } //$semicolon

  // eslint-disable-next-line no-unused-vars
  function hotDownloadUpdateChunk(chunkId) {
    const crossb = window.chrome || window.browser || window.msBrowser;
    const IS_BACKGROUND_SCRIPT = !!crossb.extension.getBackgroundPage;
    if (IS_BACKGROUND_SCRIPT) {
      var head = document.getElementsByTagName('head')[0];
      var script = document.createElement('script');
      script.type = 'text/javascript';
      script.charset = 'utf-8';
      script.src = $require$.p + $hotChunkFilename$;
      head.appendChild(script);
    } else {
      crossb.runtime.sendMessage({
        action: 'apply-hot-update',
        file: $hotChunkFilename$,
      });
    }
  }

  // eslint-disable-next-line no-unused-vars
  function hotDownloadManifest(requestTimeout) {
    const crossb = window.chrome || window.browser || window.msBrowser;
    const IS_BACKGROUND_SCRIPT = !!crossb.extension.getBackgroundPage;
    if (IS_BACKGROUND_SCRIPT) {
      return downloadManifest($hotUpdateManifestUrl$, requestTimeout);
    } else {
      const message = {
        action: 'download-hot-update-manifest',
        requestPath: $hotUpdateManifestUrl$,
        requestTimeout,
      };
      if (window.chrome) {
        return new Promise((resolve, reject) => {
          window.chrome.runtime.sendMessage(message, resp => {
            if (!resp) {
              reject(window.chrome.runtime.lastError);
            } else if (resp.resolveVal) {
              resolve(resp.resolveVal);
            } else {
              reject(resp.rejectVal);
            }
          });
        });
      } else {
        const browser = window.browser || window.msBrowser;
        return new Promise((resolve, reject) => {
          browser.runtime.sendMessage(message).then(resp => {
            if (resp.resolveVal) {
              resolve(resp.resolveVal);
            } else {
              reject(resp.rejectVal);
            }
          }, reject);
        });
      }
    }
  }
};
