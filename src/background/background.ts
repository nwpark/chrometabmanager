import {ClosedSessionStateManager} from './state-managers/closed-session-state-manager';
import {ActiveWindowStateManager} from './state-managers/active-window-state-manager';
import {v4 as uuid} from 'uuid';
import {MessageReceiverService} from '../app/services/messaging/message-receiver.service';
import {LocalStorageService} from '../app/services/storage/local-storage.service';
import {MessagePassingService} from '../app/services/messaging/message-passing.service';
import {WebpageTitleCacheService} from '../app/services/webpage-title-cache.service';
import {releasedVersions, versionUpdateScripts} from '../versioning/released-versions';
import {InstallationScript} from '../versioning/installation-scripts';
import {DriveFileDataManager} from './state-managers/drive-file-data-manager';
import {OAuth2Service} from '../app/services/drive-api/o-auth-2.service';
import {GoogleApiService} from '../app/services/drive-api/google-api.service';
import {DriveStorageService} from '../app/services/drive-api/drive-storage.service';
import {DriveAccountService} from '../app/services/drive-api/drive-account.service';
import {ChromePermissionsService} from '../app/services/chrome-permissions.service';

const head = document.getElementsByTagName('head')[0];
const script = document.createElement('script');
script.type = 'text/javascript';
// script.src = 'https://apis.google.com/js/client.js';
script.src = 'https://apis.google.com/js/api.js';
head.appendChild(script);

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

const messagePassingService = new MessagePassingService();
const messageReceiverService = new MessageReceiverService();
const localStorageService = new LocalStorageService(messagePassingService);
const webpageTitleCacheService = new WebpageTitleCacheService(localStorageService, messageReceiverService);
const activeWindowStateManager = new ActiveWindowStateManager(localStorageService, messageReceiverService, webpageTitleCacheService);
const closedSessionStateManager = new ClosedSessionStateManager(localStorageService);
const oAuth2Service = new OAuth2Service();
const googleApiService = new GoogleApiService(oAuth2Service);
const driveStorageService = new DriveStorageService(oAuth2Service, messagePassingService);
const chromePermissionsService = new ChromePermissionsService();
const driveAccountService = new DriveAccountService(driveStorageService, oAuth2Service, googleApiService, chromePermissionsService, messageReceiverService);
const driveFileDataManager = new DriveFileDataManager(
  googleApiService,
  driveAccountService,
  messageReceiverService
);

const instanceId: string = uuid();
messageReceiverService.onInstanceIdRequest$.subscribe(request => {
  request.sendResponse(Promise.resolve(instanceId));
});

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
