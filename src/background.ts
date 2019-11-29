import {ChromeAPITabState, ChromeAPIWindowState, WindowStateUtils} from './app/types/chrome-api-types';
import {RecentlyClosedSession, RecentlyClosedWindow} from './app/types/closed-session-list-state';
import {WindowLayoutState} from './app/types/window-list-state';
import {StorageService} from './app/services/storage.service';
import {ChromeEventHandlerService} from './app/services/chrome-event-handler.service';
import {merge, Observable, Subject, timer} from 'rxjs';
import {bufferToggle, filter, map, throttleTime} from 'rxjs/operators';

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
// todo: replace with async-lock
let chromeWindowStorageLock = false;

const windowStateUpdated = new Subject();
const windowStateUpdated$ = windowStateUpdated.asObservable();

throttleWithBuffer(windowStateUpdated$).subscribe(() => {
  updateStoredWindowState();
});

CHROME_WINDOW_UPDATE_EVENTS.forEach(windowEvent => {
  windowEvent.addListener(() => {
    windowStateUpdated.next();
  });
});

function throttleWithBuffer<T>(observable$: Observable<T>): Observable<T> {
  const throttled = observable$.pipe(
    throttleTime(WINDOW_UPDATE_THROTTLE_TIME)
  );

  const buffered = observable$.pipe(
    bufferToggle(throttled, () => timer(WINDOW_UPDATE_THROTTLE_TIME)),
    filter(buff => buff.length > 1),
    map(buff => buff[buff.length - 1])
  );

  return merge(throttled, buffered);
}

function updateStoredWindowState() {
  chrome.windows.getAll({populate: true}, chromeWindows => {
    if (!chromeWindowStorageLock) {
      const writeData = {};
      writeData[ACTIVE_CHROME_WINDOWS] = chromeWindows;
      chrome.storage.local.set(writeData);
    }
  });
  const message = {};
  message[ACTIVE_WINDOWS_UPDATED] = true;
  chrome.runtime.sendMessage(message);
}

chrome.windows.onRemoved.addListener((windowId) => {
  chromeWindowStorageLock = true;
  chrome.storage.local.get(ACTIVE_CHROME_WINDOWS, data => {
    const chromeWindow = data[ACTIVE_CHROME_WINDOWS].find(window => window.id === windowId);
    storeRecentlyClosedWindow(WindowStateUtils.convertToSavedWindow(chromeWindow));
    chromeWindowStorageLock = false;
    updateStoredWindowState();
  });
});

chrome.tabs.onRemoved.addListener((tabId, removeInfo) => {
  chromeWindowStorageLock = true;
  if (!removeInfo.isWindowClosing) {
    chrome.storage.local.get(ACTIVE_CHROME_WINDOWS, data => {
      const chromeWindow = data[ACTIVE_CHROME_WINDOWS].find(window => window.id === removeInfo.windowId);
      const chromeTab = chromeWindow.tabs.find(tab => tab.id === tabId);
      if (!IGNORED_TAB_URLS.includes(chromeTab.url)) {
        storeRecentlyClosedTab(WindowStateUtils.convertToSavedTab(chromeTab));
      }
      chromeWindowStorageLock = false;
      updateStoredWindowState();
    });
  }
});

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
    data[RECENTLY_CLOSED_SESSIONS] = trimClosedSessions(data[RECENTLY_CLOSED_SESSIONS]);
    chrome.storage.local.set(data);
  });
}

function storeRecentlyClosedTab(chromeTab: ChromeAPITabState) {
  chrome.storage.local.get(keyWithDefault(RECENTLY_CLOSED_SESSIONS, []), data => {
    const closedTab = {timestamp: Date.now(), chromeAPITab: chromeTab};
    if (data[RECENTLY_CLOSED_SESSIONS].length === 0 || data[RECENTLY_CLOSED_SESSIONS][0].isWindow) {
      const recentlyClosedSession = {isWindow: false, closedTabs: [closedTab]};
      data[RECENTLY_CLOSED_SESSIONS].unshift(recentlyClosedSession);
    } else {
      data[RECENTLY_CLOSED_SESSIONS][0].closedTabs.unshift(closedTab);
    }
    data[RECENTLY_CLOSED_SESSIONS] = trimClosedSessions(data[RECENTLY_CLOSED_SESSIONS]);
    chrome.storage.local.set(data);
  });
}

function keyWithDefault(keyName: string, defaultValue: any) {
  const key = {};
  key[keyName] = defaultValue;
  return key;
  // return JSON.parse(`${keyName}: ${defaultValue}`);
}

// todo: add fields to data structure to reduce work required here
function trimClosedSessions(closedSessions: RecentlyClosedSession[]) {
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
