/* global chrome, browser */
'use strict';

let _browser;
try {
    // Edge has chrome object but only chrome.app so Object which has i18n method is real API object.
    _browser = (chrome && chrome.i18n && chrome) || (browser && browser.i18n && browser)
} catch (e) {
    _browser = chrome || browser
}

// Polyfill chrome.runtime.sendMessage to return a promise.
const browserRuntimeSendMessage = (message) => {
    if (chrome) {
        return new Promise((resolve, reject) => {
            chrome.runtime.sendMessage(message, resp => {
                if (!resp) {
                    reject(chrome.runtime.lastError);
                } else {
                    resolve(resp);
                }
            });
        });
    } else {
        return browser.runtime.sendMessage(message);
    }
};

module.exports = {
    browser: _browser,
    browserRuntimeSendMessage,
};