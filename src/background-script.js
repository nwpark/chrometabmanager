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

function storeRecentlyClosedSession(chromeWindow) {
  chrome.storage.local.get(keyWithDefault(RECENTLY_CLOSED_SESSIONS, []), (data) => {
    data[RECENTLY_CLOSED_SESSIONS].unshift(chromeWindow);
    chrome.storage.local.set(data);
  });
}

function storeRecentlyClosedTab(recentlyClosedTab) {
  chrome.storage.local.get(keyWithDefault(RECENTLY_CLOSED_SESSIONS, []), (data) => {
    if (data[RECENTLY_CLOSED_SESSIONS].length === 0 || data[RECENTLY_CLOSED_SESSIONS][0].isWindow) {
      let recentlyClosedSession = {isWindow: false, tabs: [recentlyClosedTab]};
      data[RECENTLY_CLOSED_SESSIONS].unshift(recentlyClosedSession);
    } else {
      data[RECENTLY_CLOSED_SESSIONS][0].tabs.unshift(recentlyClosedTab);
    }
    chrome.storage.local.set(data);
  });
}

chrome.windows.onRemoved.addListener((windowId) => {
  chrome.storage.local.get('chromeWindows', (data) => {
    let chromeWindow = data.chromeWindows.find(chromeWindow => chromeWindow.id === windowId);
    let recentlyClosedWindow = {timestamp: Date.now(), window: chromeWindow};
    let recentlyClosedSession = {isWindow: true, window: recentlyClosedWindow};
    storeRecentlyClosedSession(recentlyClosedSession);
    storeCurrentChromeWindowState();
  });
});

chrome.tabs.onRemoved.addListener((tabId, removeInfo) => {
  if (!removeInfo.isWindowClosing) {
    chrome.storage.local.get('chromeWindows', (data) => {
      let chromeWindow = data.chromeWindows.find(chromeWindow => chromeWindow.id === removeInfo.windowId);
      let removedTab = chromeWindow.tabs.find(chromeTab => chromeTab.id === tabId);
      let recentlyClosedTab = {timestamp: Date.now(), tab: removedTab};
      storeRecentlyClosedTab(recentlyClosedTab);
      storeCurrentChromeWindowState();
    });
  }
});
