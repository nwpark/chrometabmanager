const CHROME_WINDOW_UPDATE_EVENTS = [
  chrome.tabs.onCreated,
  chrome.tabs.onUpdated,
  chrome.tabs.onMoved,
  chrome.tabs.onDetached,
  chrome.tabs.onAttached,
  chrome.tabs.onReplaced,
  chrome.windows.onCreated,
];

function storeCurrentChromeWindowState() {
  chrome.windows.getAll({populate: true}, chromeWindows => {
    localStorage.setItem('chromeWindows', JSON.stringify(chromeWindows));
  });
}

CHROME_WINDOW_UPDATE_EVENTS.forEach(windowEvent => {
  windowEvent.addListener(() => {
    storeCurrentChromeWindowState();
  });
});


function storeRecentlyClosedWindow(chromeWindow) {
  chrome.storage.local.get({recentlyClosedWindows: []}, (data) => {
    data.recentlyClosedWindows.unshift(chromeWindow);
    chrome.storage.local.set({recentlyClosedWindows: data.recentlyClosedWindows});
  });
}

chrome.windows.onRemoved.addListener((windowId) => {
  let chromeWindows = JSON.parse(localStorage.getItem('chromeWindows'));
  let removedWindow = chromeWindows.find(chromeWindow => chromeWindow.id === windowId);
  storeRecentlyClosedWindow(removedWindow);
  storeCurrentChromeWindowState();
});
