import {WindowStateUtils} from '../app/types/chrome-api-types';
import {Subject} from 'rxjs';
import {throttleTime} from 'rxjs/operators';
import {async} from 'rxjs/internal/scheduler/async';
import {ActiveChromeWindowStateManager} from './ActiveChromeWindowStateManager';
import {storeRecentlyClosedTab, storeRecentlyClosedWindow} from './RecentlyClosedSessionUtils';
import {ThrottleConfig} from 'rxjs/src/internal/operators/throttle';

const chromeWindowUpdateEvents = [
  chrome.tabs.onCreated,
  chrome.tabs.onUpdated,
  chrome.tabs.onMoved,
  chrome.tabs.onDetached,
  chrome.tabs.onAttached,
  chrome.tabs.onReplaced,
  chrome.windows.onCreated,
];

const windowUpdateThrottleTime = 100;
const throttleTimeConfig = { leading: true, trailing: true } as ThrottleConfig;
const ignoredTabUrls = ['chrome://newtab/'];

const activeWindowStateManager = new ActiveChromeWindowStateManager();

const windowStateUpdated = new Subject();
const windowStateUpdated$ = windowStateUpdated.asObservable();

chromeWindowUpdateEvents.forEach(windowEvent => {
  windowEvent.addListener(() => {
    windowStateUpdated.next();
  });
});

windowStateUpdated$.pipe(
  throttleTime(windowUpdateThrottleTime, async, throttleTimeConfig)
).subscribe(() => {
  activeWindowStateManager.updateActiveWindowState();
});

chrome.windows.onRemoved.addListener((windowId) => {
  activeWindowStateManager.getActiveChromeWindowsFromStorage().then(chromeWindows => {
    const chromeWindow = chromeWindows.find(window => window.id === windowId);
    // storeRecentlyClosedWindow(WindowStateUtils.convertToSavedWindow(chromeWindow));
    storeRecentlyClosedWindow(chromeWindow);
    activeWindowStateManager.updateActiveWindowState();
  });
});

chrome.tabs.onRemoved.addListener((tabId, removeInfo) => {
  if (removeInfo.isWindowClosing) {
    return;
  }
  activeWindowStateManager.getActiveChromeWindowsFromStorage().then(chromeWindows => {
    const chromeWindow = chromeWindows.find(window => window.id === removeInfo.windowId);
    const chromeTab = chromeWindow.tabs.find(tab => tab.id === tabId);
    if (!ignoredTabUrls.includes(chromeTab.url)) {
      // storeRecentlyClosedTab(WindowStateUtils.convertToSavedTab(chromeTab));
      storeRecentlyClosedTab(chromeTab);
    }
    activeWindowStateManager.updateActiveWindowState();
  });
});
