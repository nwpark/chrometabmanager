const CHROME_WINDOW_UPDATE_EVENTS = [
  chrome.tabs.onCreated,
  chrome.tabs.onUpdated,
  chrome.tabs.onMoved,
  chrome.tabs.onDetached,
  chrome.tabs.onAttached,
  chrome.tabs.onReplaced,
  chrome.windows.onCreated,
];

const RECENTLY_CLOSED_SESSIONS = 'recentlyClosedSessions';
const ACTIVE_CHROME_WINDOWS = 'activeChromeWindows';

chrome.storage.local.clear();

function storeCurrentChromeWindowState() {
  chrome.windows.getAll({populate: true}, chromeWindows => {
    chrome.storage.local.set({chromeWindows});
  });
}

CHROME_WINDOW_UPDATE_EVENTS.forEach(windowEvent => {
  windowEvent.addListener(() => {
    storeCurrentChromeWindowState();
  });
});

function keyWithDefault(keyName, defaultValue) {
  let key = {};
  key[keyName] = defaultValue;
  return key;
}

function storeRecentlyClosedWindow(recentlyClosedWindow) {
  chrome.storage.local.get(keyWithDefault(RECENTLY_CLOSED_SESSIONS, []), (data) => {
    let recentlyClosedSession = {isWindow: true, closedWindow: recentlyClosedWindow};
    data[RECENTLY_CLOSED_SESSIONS].unshift(recentlyClosedSession);
    chrome.storage.local.set(data);
  });
}

chrome.windows.onRemoved.addListener((windowId) => {
  chrome.storage.local.get('chromeWindows', (data) => {
    // todo: remove console log
    console.log(windowId);
    console.log(data);
    let chromeWindow = data.chromeWindows.find(chromeWindow => chromeWindow.id === windowId);
    let recentlyClosedWindow = {timestamp: Date.now(), chromeAPIWindow: chromeWindow};
    storeRecentlyClosedWindow(recentlyClosedWindow);
    storeCurrentChromeWindowState();
  });
});

function storeRecentlyClosedTab(recentlyClosedTab) {
  chrome.storage.local.get(keyWithDefault(RECENTLY_CLOSED_SESSIONS, []), (data) => {
    if (data[RECENTLY_CLOSED_SESSIONS].length === 0 || data[RECENTLY_CLOSED_SESSIONS][0].isWindow) {
      let recentlyClosedSession = {isWindow: false, closedTabs: [recentlyClosedTab]};
      data[RECENTLY_CLOSED_SESSIONS].unshift(recentlyClosedSession);
    } else {
      data[RECENTLY_CLOSED_SESSIONS][0].closedTabs.unshift(recentlyClosedTab);
    }
    chrome.storage.local.set(data);
  });
}

chrome.tabs.onRemoved.addListener((tabId, removeInfo) => {
  if (!removeInfo.isWindowClosing) {
    chrome.storage.local.get('chromeWindows', (data) => {
      let chromeWindow = data.chromeWindows.find(chromeWindow => chromeWindow.id === removeInfo.windowId);
      let chromeTab = chromeWindow.tabs.find(chromeTab => chromeTab.id === tabId);
      if (chromeTab.url !== 'chrome://newtab/') {
        let recentlyClosedTab = {timestamp: Date.now(), chromeAPITab: chromeTab};
        storeRecentlyClosedTab(recentlyClosedTab);
      }
      storeCurrentChromeWindowState();
    });
  }
});
