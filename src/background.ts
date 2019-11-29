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

const MAX_CLOSED_TABS = 50;
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
  chrome.windows.getAll({populate: true}, chromeWindows => {
    if (!chromeWindowStorageLock) {
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
    let chromeWindow = data[ACTIVE_CHROME_WINDOWS].find(chromeWindow => chromeWindow.id === windowId);
    storeRecentlyClosedWindow(convertToClosedWindow(chromeWindow));
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
        storeRecentlyClosedTab(convertToClosedTab(chromeTab));
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
    let windowLayoutState = {windowId: chromeWindow.id, title: `${new Date().toTimeString().substring(0, 5)}`, hidden: true};
    data[RECENTLY_CLOSED_SESSIONS].unshift(closedSession);
    data[RECENTLY_CLOSED_SESSIONS_LAYOUT_STATE].windowStates.unshift(windowLayoutState);
    data[RECENTLY_CLOSED_SESSIONS] = trimClosedSessions(data[RECENTLY_CLOSED_SESSIONS]);
    chrome.storage.local.set(data);
  });
}

function storeRecentlyClosedTab(chromeTab) {
  chrome.storage.local.get(keyWithDefault(RECENTLY_CLOSED_SESSIONS, []), data => {
    let closedTab = {timestamp: Date.now(), chromeAPITab: chromeTab};
    if (data[RECENTLY_CLOSED_SESSIONS].length === 0 || data[RECENTLY_CLOSED_SESSIONS][0].isWindow) {
      let recentlyClosedSession = {isWindow: false, closedTabs: [closedTab]};
      data[RECENTLY_CLOSED_SESSIONS].unshift(recentlyClosedSession);
    } else {
      data[RECENTLY_CLOSED_SESSIONS][0].closedTabs.unshift(closedTab);
    }
    data[RECENTLY_CLOSED_SESSIONS] = trimClosedSessions(data[RECENTLY_CLOSED_SESSIONS]);
    chrome.storage.local.set(data);
  });
}

// todo: needs new id
function convertToClosedWindow(chromeWindow) {
  const clonedWindow = JSON.parse(JSON.stringify(chromeWindow));
  const closedTabs = clonedWindow.tabs.map(tab => convertToClosedTab(tab));
  return {...clonedWindow, tabs: closedTabs};
}

// todo: needs new id
function convertToClosedTab(chromeTab) {
  const clonedTab = JSON.parse(JSON.stringify(chromeTab));
  return {...clonedTab, status: 'complete'};
}

function keyWithDefault(keyName, defaultValue) {
  let key = {};
  key[keyName] = defaultValue;
  return key;
}

// todo: add fields to data structure to reduce work required here
function trimClosedSessions(closedSessions) {
  let maxIndex, tabsAtMax;
  closedSessions.reduce((acc, session, index) => {
    let totalTabs = acc + (session.isWindow
      ? session.closedWindow.chromeAPIWindow.tabs.length
      : session.closedTabs.length);
    if (acc < MAX_CLOSED_TABS && totalTabs >= MAX_CLOSED_TABS) {
      tabsAtMax = totalTabs;
      maxIndex = index;
    }
    return totalTabs;
  }, 0);
  if (maxIndex !== undefined) {
    console.log(maxIndex);
    console.log(tabsAtMax);
    closedSessions = closedSessions.slice(0, maxIndex + 1);
    if (!closedSessions[maxIndex].isWindow && tabsAtMax > MAX_CLOSED_TABS) {
      closedSessions[maxIndex].closedTabs= closedSessions[maxIndex].closedTabs.slice(0, MAX_CLOSED_TABS - tabsAtMax);
    }
  }
  return closedSessions;
}
