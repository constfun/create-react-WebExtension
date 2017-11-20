/* globals browser chrome hotAddUpdateChunk parentHotUpdateCallback $hotChunkFilename$ $hotUpdateManifestUrl$ */
'use strict';

module.exports = function () {
    // eslint-disable-next-line no-unused-vars
    function webpackHotUpdateCallback(chunkId, moreModules) {
        hotAddUpdateChunk(chunkId, moreModules);
        if (parentHotUpdateCallback) {
            parentHotUpdateCallback(chunkId, moreModules);
        }
    } //$semicolon

    const IS_CHROME = /Chrome/.test(navigator.userAgent);
    const IS_BACKGROUND_SCRIPT =
        (IS_CHROME && !!chrome.extension.getBackgroundPage) ||
        !!browser.extension.getBackgroundPage;

    const IS_EXTENSION_URL =
        /^moz-extension:/.test(window.location.href) ||
        /^chrome-extension:/.test(window.location.href);

    // Polyfill chrome.runtime.sendMessage to return a promise.
    const browserRuntimeSendMessage = (message) => {
        if (IS_CHROME) {
            return new Promise((resolve, reject) => {
                chrome.runtime.sendMessage(message, resp => {
                    if (!resp) {
                        reject(window.chrome.runtime.lastError);
                    } else {
                        resolve(resp);
                    }
                });
            });
        } else {
            return browser.runtime.sendMessage(message);
        }
    }

    // eslint-disable-next-line no-unused-vars
    function hotDownloadUpdateChunk(chunkId) {
        if (IS_BACKGROUND_SCRIPT || IS_EXTENSION_URL) {
            // Background scripts are runing in the same context as the background page,
            // so we can execute a script by simply injecting a script tag.
            // Frames can be loaded from extension urls, even though they are content scripts,
            // so such frames and also simple inject a script tag.
            var head = document.getElementsByTagName('head')[0];
            var script = document.createElement('script');
            script.type = 'text/javascript';
            script.charset = 'utf-8';
            script.src = $hotChunkFilename$;
            head.appendChild(script);
        } else {
            // Content scripts are running in a sandbox on the host page.
            // Inserting a script tag into the dom will NOT execute the script in the sandbox context.
            // We delegate to the background script to do our bidding.
            browserRuntimeSendMessage({
                action: 'execute-script',
                file: $hotChunkFilename$,
            })
                // We are asking to replace ourselves, the port will disconnect
                // immediately after the message is sent.
                .catch(err => {
                    // Regardless, lets make sure that we're silencing the right exception,
                    // because silently eating exceptions is not cool.
                    if (err.message !== "The message port closed before a reponse was received.") {
                        throw err;
                    }
                });
        }
    }

    // eslint-disable-next-line no-unused-vars
    function hotDownloadManifest() {
        if (IS_BACKGROUND_SCRIPT) {
            // Background scripts can download the manifest directly.
            return fetch($hotUpdateManifestUrl$)
                .then(resp => {
                    switch (resp.status) {
                        case 404:
                            // No updates.
                            return Promise.resolve();
                        case 200:
                        case 304:
                            return resp.json();
                        default:
                            throw resp;
                    }
                });
        }
        else {
            // Content scripts may be restricted from fetching the manifest by Content Security Policy.
            // Also, proxying through our background script here also allows us to bypass HTTPS for secure host pages.
            return browserRuntimeSendMessage({
                action: 'fetch-hot-update-manifest',
                requestPath: $hotUpdateManifestUrl$,
            })
                .then(resp => {
                    if (resp.noUpdates) {
                        return Promise.resolve();
                    }
                    if (resp.json) {
                        return resp.json;
                    }
                    if (resp.err) {
                        return Promise.reject(resp.err);
                    }
                });
        }
    }
};
