import {ClosedSessionStateManager} from './closed-session-state-manager';
import {ActiveWindowStateManager} from './active-window-state-manager';

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

const ignoredTabUrls = ['chrome://newtab/'];

const activeWindowStateManager = new ActiveWindowStateManager();
const closedSessionStateManager = new ClosedSessionStateManager();

chromeWindowUpdateEvents.forEach(windowEvent => {
  windowEvent.addListener(() => {
    activeWindowStateManager.updateActiveWindowState();
  });
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
    }
  });
}
