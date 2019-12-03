import {Subject} from 'rxjs';
import {throttleTime} from 'rxjs/operators';
import {async} from 'rxjs/internal/scheduler/async';
import {ThrottleConfig} from 'rxjs/src/internal/operators/throttle';
import {ClosedSessionStateManager} from './closed-session-state-manager';
import {ActiveWindowStateManager} from './active-window-state-manager';

const chromeWindowUpdateEvents = [
  chrome.tabs.onCreated,
  chrome.tabs.onUpdated,
  chrome.tabs.onMoved,
  chrome.tabs.onDetached,
  chrome.tabs.onAttached,
  chrome.tabs.onReplaced,
  chrome.windows.onCreated,
];

const windowUpdateThrottleTime = 500;
const windowUpdateThrottleConfig = { leading: true, trailing: true } as ThrottleConfig;
const windowStateUpdated = new Subject();
const windowStateUpdated$ = windowStateUpdated.asObservable();

const ignoredTabUrls = ['chrome://newtab/'];

const activeWindowStateManager = new ActiveWindowStateManager();
const closedSessionStateManager = new ClosedSessionStateManager();

chromeWindowUpdateEvents.forEach(windowEvent => {
  windowEvent.addListener(() => {
    windowStateUpdated.next();
  });
});

windowStateUpdated$.pipe(
  throttleTime(windowUpdateThrottleTime, async, windowUpdateThrottleConfig)
).subscribe(() => {
  activeWindowStateManager.updateActiveWindowState();
});

chrome.windows.onRemoved.addListener((windowId) => {
  const chromeWindow = activeWindowStateManager.getWindow(windowId);
  if (chromeWindow.tabs.length > 0) {
    closedSessionStateManager.storeClosedWindow(chromeWindow);
  }
  activeWindowStateManager.updateActiveWindowState();
});

chrome.tabs.onRemoved.addListener((tabId, removeInfo) => {
  if (removeInfo.isWindowClosing) {
    return;
  }
  const chromeTab = activeWindowStateManager.getTab(removeInfo.windowId, tabId);
  if (!ignoredTabUrls.includes(chromeTab.url)) {
    closedSessionStateManager.storeClosedTab(chromeTab);
  }
  activeWindowStateManager.updateActiveWindowState();
});
