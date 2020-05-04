import {ReleaseNotes} from './released-versions';

// tslint:disable-next-line:variable-name
export const releaseNotes_0_7_0: ReleaseNotes = {
  releaseDate: new Date(2020, 4, 5),
  changes: [{
    title: 'New and improved sync storage!',
    details: [
      'Sync storage now uses Google Drive cloud services to synchronize your saved data between devices.',
      'If you had sync enabled, it has now been disabled and your saved tabs have been copied back to local storage. You will need to re-enable sync from the options page.'
    ]
  }, {
    title: 'Why Google Drive?',
    details: [
      'Increased storage quota - you can now store as many saved tabs as you want!',
      'Improved reliability - sync storage was previously somewhat fragile.. it failed to work in certain environments and provided no information to aid troubleshooting. Drive storage is more robust, it is completely decoupled from the browsing environment and provides a proper diagnosis when something doesn\'t work.',
      'Cross-browser support (not yet supported, but coming soon!) - Drive storage will eventually allow you to synchronize saved tabs between all browsers which support the extension.'
    ]
  }]
};

export function versionUpdateScript_0_7_0(): Promise<void> {
  return copyDataIfSyncEnabled().finally(() => {
    return resetPreferences();
  });
}

function copyDataIfSyncEnabled(): Promise<void> {
  return getPreferences().then(preferences => {
    if (preferences.syncSavedWindows) {
      return copySyncDataToLocal();
    }
  });
}

function resetPreferences(): Promise<void> {
  return getPreferences().then(preferences => {
    preferences.showReleaseNotesOnStartup = true;
    preferences.syncSavedWindows = false;
    return setPreferences(preferences);
  });
}

function getPreferences(): Promise<any> {
  return new Promise(resolve => {
    chrome.storage.sync.get('preferencesStorage_166b6914', data => {
      resolve(data['preferencesStorage_166b6914']);
    });
  });
}

function setPreferences(preferences): Promise<void> {
  return new Promise(resolve => {
    chrome.storage.sync.set({'preferencesStorage_166b6914': preferences}, resolve);
  });
}

function copySyncDataToLocal(): Promise<void> {
  return Promise.all([
    getSavedSessionStateSync(),
    getSavedSessionStateLocal()
  ]).then(([sessionListStateSync, sessionListStateLocal]) => {
    const syncSessionIds = new Set(
      sessionListStateSync.sessionStates.map(sessionState =>
        sessionState.layoutState.sessionId.toString()
      ));
    sessionListStateLocal.sessionStates = sessionListStateLocal.sessionStates
      .filter(sessionState => !syncSessionIds.has(sessionState.layoutState.sessionId.toString()));

    sessionListStateSync.sessionStates.push(...sessionListStateLocal.sessionStates);

    return storeCopiedSessionState(sessionListStateSync);
  });
}

function getSavedSessionStateSync(): Promise<any> {
  return new Promise(resolve => {
    chrome.storage.sync.get(data => {
      const layoutState = data['savedWindowsLayoutStateStorage_00adb476'];
      const sessionStates = getSortedSessionStates(data, layoutState);
      resolve({sessionStates, hidden: layoutState.hidden});
    });
  });
}

function getSortedSessionStates(storageData, listLayoutState) {
  const sessionStates = listLayoutState.sessionLayoutStates.map(layoutState => {
    const sessionState = storageData[layoutState.sessionId];
    delete storageData[layoutState.sessionId];
    return sessionState;
  });
  filterSessionStatesFromStorageData(storageData).forEach(sessionState => sessionStates.push(sessionState));
  return sessionStates;
}

function filterSessionStatesFromStorageData(data) {
  const sessionKeyLength = 36;
  return Object.entries(data)
    .filter(entry => entry[0].length === sessionKeyLength)
    .map(entry => entry[1]);
}

function getSavedSessionStateLocal(): Promise<any> {
  return new Promise(resolve => {
    chrome.storage.local.get([
      'savedWindowsStorage_0a565f6f',
      'savedWindowsLayoutStateStorage_00adb476'
    ], data => {
      const sessionMap = data['savedWindowsStorage_0a565f6f'];
      const listLayoutState = data['savedWindowsLayoutStateStorage_00adb476'];
      const sessionStates = listLayoutState.sessionLayoutStates
        .map(layoutState => {
          return {session: sessionMap[layoutState.sessionId], layoutState};
        });
      resolve({sessionStates, hidden: listLayoutState.hidden});
    });
  });
}

function storeCopiedSessionState(sessionListState): Promise<void> {
  return new Promise(resolve => {
    const sessionMap = {};
    sessionListState.sessionStates.forEach(sessionState => {
      sessionMap[sessionState.layoutState.sessionId] = sessionState.session;
    });
    const layoutState = {
      sessionLayoutStates: sessionListState.sessionStates.map(sessionState => sessionState.layoutState),
      hidden: sessionListState.hidden
    };
    chrome.storage.local.set({
      ['savedWindowsStorage_0a565f6f']: sessionMap,
      ['savedWindowsLayoutStateStorage_00adb476']: layoutState
    }, resolve);
  });
}
