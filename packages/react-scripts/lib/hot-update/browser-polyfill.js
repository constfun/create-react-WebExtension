/* global browser, chrome */
'use strict';

require('chrome-browser-object-polyfill');

// Polyfill chrome.runtime.sendMessage to return a promise.
browser.runtime.sendMessage = (message) => {
    if (window.chrome) {
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
};

module.exports = browser;