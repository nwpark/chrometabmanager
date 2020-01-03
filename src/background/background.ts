import {ClosedSessionStateManager} from './closed-session-state-manager';
import {ActiveWindowStateManager} from './active-window-state-manager';
import {v4 as uuid} from 'uuid';
import {MessageReceiverService} from '../app/services/messaging/message-receiver.service';
import {StorageKeys} from '../app/services/storage/storage-keys';

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

const instanceId = uuid();
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

MessageReceiverService.onInstanceIdRequest(instanceId);

function addOnInstalledListener() {
  chrome.runtime.onInstalled.addListener(details => {
    if (details.reason === 'update' && details.previousVersion !== chrome.runtime.getManifest().version) {
      const local = new Promise(resolve => {
        chrome.storage.local.get([
          StorageKeys.SavedWindowsLayoutState,
          StorageKeys.ActiveWindowsLayoutState,
          StorageKeys.RecentlyClosedSessionsLayoutState
        ], data => {
          if (data[StorageKeys.SavedWindowsLayoutState].sessionStates) {
            data[StorageKeys.SavedWindowsLayoutState].sessionLayoutStates = data[StorageKeys.SavedWindowsLayoutState].sessionStates;
            delete data[StorageKeys.SavedWindowsLayoutState].sessionStates;
          }
          if (data[StorageKeys.ActiveWindowsLayoutState].sessionStates) {
            data[StorageKeys.ActiveWindowsLayoutState].sessionLayoutStates = data[StorageKeys.ActiveWindowsLayoutState].sessionStates;
            delete data[StorageKeys.ActiveWindowsLayoutState].sessionStates;
          }
          if (data[StorageKeys.RecentlyClosedSessionsLayoutState].sessionStates) {
            data[StorageKeys.RecentlyClosedSessionsLayoutState].sessionLayoutStates = data[StorageKeys.RecentlyClosedSessionsLayoutState].sessionStates;
            delete data[StorageKeys.RecentlyClosedSessionsLayoutState].sessionStates;
          }
          chrome.storage.local.set(data, resolve);
        });
      });
      const sync = new Promise(resolve => {
        chrome.storage.sync.get([
          StorageKeys.SavedWindowsLayoutState
        ], data => {
          if (data[StorageKeys.SavedWindowsLayoutState].sessionStates) {
            data[StorageKeys.SavedWindowsLayoutState].sessionLayoutStates = data[StorageKeys.SavedWindowsLayoutState].sessionStates;
            delete data[StorageKeys.SavedWindowsLayoutState].sessionStates;
          }
          chrome.storage.sync.set(data, resolve);
        });
      });
      Promise.all([local, sync]).then(() => chrome.runtime.reload());
    }
  });
}
