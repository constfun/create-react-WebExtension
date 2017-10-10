/* global chrome */
'use strict';

let browser;
try {
    // Edge has chrome object but only chrome.app so Object which has i18n method is real API object.
    browser = global.chrome = (global.chrome && global.chrome.i18n && global.chrome) || (global.browser && global.browser.i18n && global.browser)
} catch (e) {
    let global = window
    browser = global.chrome = global.chrome || global.browser
}

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