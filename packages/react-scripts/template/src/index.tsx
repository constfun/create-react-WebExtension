browser.browserAction.onClicked.addListener((e) => {
    browser.tabs.query({active: true, currentWindow: true}).then((tabs: browser.tabs.Tab[]) => {
        browser.tabs.sendMessage(tabs[0].id as number, {}, () => {});
    });
});
