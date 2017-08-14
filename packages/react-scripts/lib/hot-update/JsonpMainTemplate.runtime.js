/* globals hotAddUpdateChunk parentHotUpdateCallback $hotChunkFilename$ $hotUpdateManifestUrl$ */

module.exports = function() {
  // eslint-disable-next-line no-unused-vars
  function webpackHotUpdateCallback(chunkId, moreModules) {
    hotAddUpdateChunk(chunkId, moreModules);
    if (parentHotUpdateCallback) parentHotUpdateCallback(chunkId, moreModules);
  } //$semicolon

  // eslint-disable-next-line no-unused-vars
  function hotDownloadUpdateChunk(chunkId) {
    const crossb = window.chrome || window.browser || window.msBrowser;
    crossb.runtime.sendMessage({
      action: 'apply-hot-update',
      file: $hotChunkFilename$,
    });
  }

  // eslint-disable-next-line no-unused-vars
  function hotDownloadManifest(requestTimeout) {
    const message = {
      action: 'download-hot-update-manifest',
      requestPath: $hotUpdateManifestUrl$,
      requestTimeout,
    };
    if (window.chrome) {
      return new Promise((resolve, reject) => {
        window.chrome.runtime.sendMessage(message, resp => {
          if (!resp) {
            reject(window.chrome.lastError);
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
};
