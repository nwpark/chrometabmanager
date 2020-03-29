import {ClosedSessionStateManager} from './closed-session-state-manager';
import {ActiveWindowStateManager} from './active-window-state-manager';
import {v4 as uuid} from 'uuid';
import {MessageReceiverService} from '../app/services/messaging/message-receiver.service';
import {LocalStorageService} from '../app/services/storage/local-storage.service';
import {MessagePassingService} from '../app/services/messaging/message-passing.service';
import {WebpageTitleCacheService} from '../app/services/webpage-title-cache.service';
import {releasedVersions, versionUpdateScripts} from '../versioning/released-versions';
import {InstallationScript} from '../versioning/installation-scripts';
import {isNullOrUndefined} from 'util';

addOnInstalledListener();

const chromeWindowUpdateEvents = [
  chrome.tabs.onCreated,
  chrome.tabs.onUpdated,
  chrome.tabs.onMoved,
  chrome.tabs.onActivated,
  chrome.tabs.onHighlighted,
  chrome.tabs.onDetached,
  chrome.tabs.onAttached,
  chrome.tabs.onReplaced,
  chrome.windows.onCreated,
];

const ignoredTabUrls = ['chrome://newtab/'];

const localStorageService = new LocalStorageService(new MessagePassingService());
const messageReceiverService = new MessageReceiverService();
const webpageTitleCacheService = new WebpageTitleCacheService(localStorageService, messageReceiverService);
const activeWindowStateManager = new ActiveWindowStateManager(localStorageService, messageReceiverService, webpageTitleCacheService);
const closedSessionStateManager = new ClosedSessionStateManager(localStorageService);

const instanceId = uuid();
messageReceiverService.onInstanceIdRequest(instanceId);

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
    if (details.reason === 'update' && details.previousVersion !== chrome.runtime.getManifest().version) {
      const previousVersionIndex = releasedVersions.indexOf(details.previousVersion);
      const versionsToInstall = releasedVersions.slice(previousVersionIndex + 1);
      const installationScripts = versionsToInstall.map(versionNumber => versionUpdateScripts[versionNumber]);
      installUpdates(installationScripts).then(() => {
        chrome.runtime.reload();
      });
    }
  });
}

function installUpdates(installationScripts: InstallationScript[]) {
  return installationScripts.reduce((installComplete$, nextScript) => {
    return installComplete$.then(nextScript);
  }, Promise.resolve());
}
