import {ChromeAPITabState, ChromeAPIWindowState, WindowStateUtils} from './app/types/chrome-api-types';
import {RecentlyClosedSession, RecentlyClosedWindow} from './app/types/closed-session-list-state';
import {WindowLayoutState} from './app/types/window-list-state';
import {StorageService} from './app/services/storage.service';
import {ChromeEventHandlerService} from './app/services/chrome-event-handler.service';
import {Subject} from 'rxjs';
import {throttleTime} from 'rxjs/operators';
import {async} from 'rxjs/internal/scheduler/async';
import Mutex from 'async-mutex/lib/Mutex';

const CHROME_WINDOW_UPDATE_EVENTS = [
  chrome.tabs.onCreated,
  chrome.tabs.onUpdated,
  chrome.tabs.onMoved,
  chrome.tabs.onDetached,
  chrome.tabs.onAttached,
  chrome.tabs.onReplaced,
  chrome.windows.onCreated,
];

const RECENTLY_CLOSED_SESSIONS = StorageService.RECENTLY_CLOSED_SESSIONS;
const RECENTLY_CLOSED_SESSIONS_LAYOUT_STATE = StorageService.RECENTLY_CLOSED_SESSIONS_LAYOUT_STATE;
const ACTIVE_WINDOWS_UPDATED = ChromeEventHandlerService.ACTIVE_WINDOWS_UPDATED;
const ACTIVE_CHROME_WINDOWS = 'activeChromeWindows';

const MAX_CLOSED_TABS = 50;
const IGNORED_TAB_URLS = ['chrome://newtab/'];
const WINDOW_UPDATE_THROTTLE_TIME = 100;
const activeWindowStorageMutex = new Mutex();

const windowStateUpdated = new Subject();
const windowStateUpdated$ = windowStateUpdated.asObservable();

windowStateUpdated$.pipe(
  throttleTime(WINDOW_UPDATE_THROTTLE_TIME, async, { leading: true, trailing: true })
).subscribe(() => {
  updateActiveWindowState();
});

CHROME_WINDOW_UPDATE_EVENTS.forEach(windowEvent => {
  windowEvent.addListener(() => {
    windowStateUpdated.next();
  });
});

chrome.windows.onRemoved.addListener((windowId) => {
  getActiveChromeWindowsFromStorage().then(chromeWindows => {
    const chromeWindow = chromeWindows.find(window => window.id === windowId);
    storeRecentlyClosedWindow(WindowStateUtils.convertToSavedWindow(chromeWindow));
    updateActiveWindowState();
  });
});

chrome.tabs.onRemoved.addListener((tabId, removeInfo) => {
  if (removeInfo.isWindowClosing) {
    return;
  }
  getActiveChromeWindowsFromStorage().then(chromeWindows => {
    const chromeWindow = chromeWindows.find(window => window.id === removeInfo.windowId);
    const chromeTab = chromeWindow.tabs.find(tab => tab.id === tabId);
    if (!IGNORED_TAB_URLS.includes(chromeTab.url)) {
      storeRecentlyClosedTab(WindowStateUtils.convertToSavedTab(chromeTab));
    }
    updateActiveWindowState();
  });
});

// todo: move these functions to active window class
function updateActiveWindowState() {
  chrome.runtime.sendMessage(keyWithValue(ACTIVE_WINDOWS_UPDATED, true));
  chrome.windows.getAll({populate: true}, chromeWindows => {
    storeActiveChromeWindows(chromeWindows as ChromeAPIWindowState[]);
  });
}

function storeActiveChromeWindows(chromeWindows: ChromeAPIWindowState[]) {
  activeWindowStorageMutex.acquire().then(releaseLock => {
    chrome.storage.local.set(keyWithValue(ACTIVE_CHROME_WINDOWS, chromeWindows), releaseLock);
  });
}

function getActiveChromeWindowsFromStorage(): Promise<ChromeAPIWindowState[]> {
  return new Promise<ChromeAPIWindowState[]>(resolve => {
    activeWindowStorageMutex.acquire().then(releaseLock => {
      chrome.storage.local.get(ACTIVE_CHROME_WINDOWS, data => {
        releaseLock();
        resolve(data[ACTIVE_CHROME_WINDOWS] as ChromeAPIWindowState[]);
      });
    });
  });
}

// todo: move these functions to recently closed window class
function storeRecentlyClosedWindow(chromeWindow: ChromeAPIWindowState) {
  const storageKey = {};
  storageKey[RECENTLY_CLOSED_SESSIONS] = [];
  storageKey[RECENTLY_CLOSED_SESSIONS_LAYOUT_STATE] = {hidden: true, windowStates: []};
  chrome.storage.local.get(storageKey, data => {
    const closedWindow = {timestamp: Date.now(), chromeAPIWindow: chromeWindow} as RecentlyClosedWindow;
    const closedSession = {isWindow: true, closedWindow} as RecentlyClosedSession;
    const windowLayoutState = {windowId: chromeWindow.id, title: `${new Date().toTimeString().substring(0, 5)}`, hidden: true} as WindowLayoutState;
    data[RECENTLY_CLOSED_SESSIONS].unshift(closedSession);
    data[RECENTLY_CLOSED_SESSIONS_LAYOUT_STATE].windowStates.unshift(windowLayoutState);
    data[RECENTLY_CLOSED_SESSIONS] = removeExpiredSessions(data[RECENTLY_CLOSED_SESSIONS]);
    chrome.storage.local.set(data);
  });
}

function storeRecentlyClosedTab(chromeTab: ChromeAPITabState) {
  chrome.storage.local.get(keyWithValue(RECENTLY_CLOSED_SESSIONS, []), data => {
    const closedTab = {timestamp: Date.now(), chromeAPITab: chromeTab};
    if (data[RECENTLY_CLOSED_SESSIONS].length === 0 || data[RECENTLY_CLOSED_SESSIONS][0].isWindow) {
      const recentlyClosedSession = {isWindow: false, closedTabs: [closedTab]};
      data[RECENTLY_CLOSED_SESSIONS].unshift(recentlyClosedSession);
    } else {
      data[RECENTLY_CLOSED_SESSIONS][0].closedTabs.unshift(closedTab);
    }
    data[RECENTLY_CLOSED_SESSIONS] = removeExpiredSessions(data[RECENTLY_CLOSED_SESSIONS]);
    chrome.storage.local.set(data);
  });
}

// todo: add fields to data structure to reduce work required here
function removeExpiredSessions(closedSessions: RecentlyClosedSession[]) {
  let maxIndex;
  let tabsAtMax;
  closedSessions.reduce((acc, session, index) => {
    const totalTabs = acc + (session.isWindow
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
      closedSessions[maxIndex].closedTabs = closedSessions[maxIndex].closedTabs.slice(0, MAX_CLOSED_TABS - tabsAtMax);
    }
  }
  return closedSessions;
}

function keyWithValue(keyName: string, defaultValue: any) {
  const key = {};
  key[keyName] = defaultValue;
  return key;
}
