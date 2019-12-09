import {Subject} from 'rxjs';
import {throttleTime} from 'rxjs/operators';
import {async} from 'rxjs/internal/scheduler/async';
import {ThrottleConfig} from 'rxjs/src/internal/operators/throttle';
import {ClosedSessionStateManager} from './closed-session-state-manager';
import {ActiveWindowStateManager} from './active-window-state-manager';
import {SessionListLayoutState, SessionListState, SessionListUtils, SessionMap} from '../app/types/session-list-state';
import {ChromeStorageUtils} from '../app/classes/chrome-storage-utils';
import {SessionUtils} from '../app/types/chrome-api-types';

addOnInstalledListener();

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

function addOnInstalledListener() {
  chrome.runtime.onInstalled.addListener(details => {
    if (details.previousVersion === '0.3.9') {
      chrome.storage.local.get([
        ChromeStorageUtils.SAVED_WINDOWS,
        ChromeStorageUtils.SAVED_WINDOWS_LAYOUT_STATE
      ], data => {
        const savedWindows = data[ChromeStorageUtils.SAVED_WINDOWS];
        const sessionListState = SessionListState.empty();
        savedWindows.forEach(chromeWindow => {
          const session = SessionUtils.createSessionFromWindow(chromeWindow);
          const layoutState = SessionListUtils.createBasicWindowLayoutState(chromeWindow.id);
          sessionListState.unshiftSession(session, layoutState);
        });
        chrome.storage.local.clear();
        ChromeStorageUtils.setSavedWindowsStateLocal(sessionListState);
        chrome.runtime.reload();
      });
    } else if (details.previousVersion === '0.4.0') {
      chrome.storage.local.get([
        ChromeStorageUtils.SAVED_WINDOWS,
        ChromeStorageUtils.SAVED_WINDOWS_LAYOUT_STATE
      ], data => {
        const savedWindows: SessionMap = data[ChromeStorageUtils.SAVED_WINDOWS];
        const layoutState: SessionListLayoutState = data[ChromeStorageUtils.SAVED_WINDOWS_LAYOUT_STATE];
        layoutState.sessionStates.forEach(sessionState => {
          savedWindows[sessionState.sessionId].lastModified = undefined;
          savedWindows[sessionState.sessionId].window.type = 'normal';
        });
        chrome.storage.local.clear();
        chrome.storage.local.set({
          [ChromeStorageUtils.SAVED_WINDOWS]: savedWindows,
          [ChromeStorageUtils.SAVED_WINDOWS_LAYOUT_STATE]: layoutState
        });
        chrome.runtime.reload();
      });
    }
  });
}
