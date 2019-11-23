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
const RECENTLY_CLOSED_SESSIONS_LAYOUT_STATE = 'recentlyClosedSessionsLayoutState';
const ACTIVE_CHROME_WINDOWS = 'activeChromeWindows';
const ACTIVE_WINDOWS_UPDATED = 'activeWindowsUpdated';
const IGNORED_TAB_URLS = ['chrome://newtab/'];
const WINDOW_UPDATE_TIMEOUT_MILLIS = 100; // throttle window updates

let chromeWindowUpdateQueued = false;
// todo: replace with async-lock
let chromeWindowStorageLock = false;


CHROME_WINDOW_UPDATE_EVENTS.forEach(windowEvent => {
  windowEvent.addListener(() => {
    updateStoredWindowStateThrottled();
  });
});

function updateStoredWindowStateThrottled() {
  if (!chromeWindowUpdateQueued) {
    chromeWindowUpdateQueued = true;
    setTimeout(() => {
      updateStoredWindowState();
      chromeWindowUpdateQueued = false;
    }, WINDOW_UPDATE_TIMEOUT_MILLIS);
  }
}

function updateStoredWindowState() {
  console.log('updateStoredWindowState invoked');
  chrome.windows.getAll({populate: true}, chromeWindows => {
    if (!chromeWindowStorageLock) {
      console.log('storing windows:');
      console.log(chromeWindows);
      let writeData = {};
      writeData[ACTIVE_CHROME_WINDOWS] = chromeWindows;
      chrome.storage.local.set(writeData);
    }
  });
  let message = {};
  message[ACTIVE_WINDOWS_UPDATED] = true;
  chrome.runtime.sendMessage(message);
}

chrome.windows.onRemoved.addListener((windowId) => {
  chromeWindowStorageLock = true;
  chrome.storage.local.get(ACTIVE_CHROME_WINDOWS, data => {
    console.log(`window removed: ${windowId}`);
    console.log(data);
    let chromeWindow = data[ACTIVE_CHROME_WINDOWS].find(chromeWindow => chromeWindow.id === windowId);
    storeRecentlyClosedWindow(chromeWindow);
    chromeWindowStorageLock = false;
    updateStoredWindowState();
  });
});

chrome.tabs.onRemoved.addListener((tabId, removeInfo) => {
  chromeWindowStorageLock = true;
  if (!removeInfo.isWindowClosing) {
    chrome.storage.local.get(ACTIVE_CHROME_WINDOWS, data => {
      let chromeWindow = data[ACTIVE_CHROME_WINDOWS].find(chromeWindow => chromeWindow.id === removeInfo.windowId);
      let chromeTab = chromeWindow.tabs.find(chromeTab => chromeTab.id === tabId);
      if (!IGNORED_TAB_URLS.includes(chromeTab.url)) {
        let recentlyClosedTab = {timestamp: Date.now(), chromeAPITab: chromeTab};
        storeRecentlyClosedTab(recentlyClosedTab);
      }
      chromeWindowStorageLock = false;
      updateStoredWindowState();
    });
  }
});

function storeRecentlyClosedWindow(chromeWindow) {
  let storageKey = {};
  storageKey[RECENTLY_CLOSED_SESSIONS] = [];
  storageKey[RECENTLY_CLOSED_SESSIONS_LAYOUT_STATE] = {hidden: true, windowStates: []};
  chrome.storage.local.get(storageKey, data => {
    let closedWindow = {timestamp: Date.now(), chromeAPIWindow: chromeWindow};
    let closedSession = {isWindow: true, closedWindow: closedWindow};
    // let windowLayoutState = {windowId: chromeWindow.id, title: null, hidden: true};
    let windowLayoutState = {windowId: chromeWindow.id, title: `${new Date().toTimeString().substring(0, 5)}`, hidden: true};
    data[RECENTLY_CLOSED_SESSIONS].unshift(closedSession);
    data[RECENTLY_CLOSED_SESSIONS_LAYOUT_STATE].windowStates.unshift(windowLayoutState);
    chrome.storage.local.set(data);
  });
}

function storeRecentlyClosedTab(recentlyClosedTab) {
  chrome.storage.local.get(keyWithDefault(RECENTLY_CLOSED_SESSIONS, []), data => {
    if (data[RECENTLY_CLOSED_SESSIONS].length === 0 || data[RECENTLY_CLOSED_SESSIONS][0].isWindow) {
      let recentlyClosedSession = {isWindow: false, closedTabs: [recentlyClosedTab]};
      data[RECENTLY_CLOSED_SESSIONS].unshift(recentlyClosedSession);
    } else {
      data[RECENTLY_CLOSED_SESSIONS][0].closedTabs.unshift(recentlyClosedTab);
    }
    chrome.storage.local.set(data);
  });
}

function keyWithDefault(keyName, defaultValue) {
  let key = {};
  key[keyName] = defaultValue;
  return key;
}
