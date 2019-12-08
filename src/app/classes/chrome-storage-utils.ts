import {SessionListLayoutState, SessionListState, SessionListUtils} from '../types/session-list-state';
import {MessagePassingService} from '../services/message-passing.service';
import {Preferences, PreferenceUtils} from '../types/preferences';

export class ChromeStorageUtils {

  static readonly SAVED_WINDOWS = 'savedWindowsStorage_0a565f6f';
  static readonly SAVED_WINDOWS_LAYOUT_STATE = 'savedWindowsLayoutStateStorage_00adb476';
  static readonly ACTIVE_WINDOWS = 'activeWindowsStorage_2e062a09';
  static readonly ACTIVE_WINDOWS_LAYOUT_STATE = 'activeWindowsLayoutStateStorage_41b6b427';
  static readonly RECENTLY_CLOSED_SESSIONS = 'closedSessionsStorage_882c0c64';
  static readonly RECENTLY_CLOSED_SESSIONS_LAYOUT_STATE = 'closedSessionsLayoutStateStorage_b120de96';
  static readonly PREFERENCES = 'preferencesStorage_166b6914';

  static getSavedWindowsStateLocal(): Promise<SessionListState> {
    return new Promise<SessionListState>(resolve => {
      chrome.storage.local.get([ChromeStorageUtils.SAVED_WINDOWS, ChromeStorageUtils.SAVED_WINDOWS_LAYOUT_STATE], data => {
        const savedWindows = data[ChromeStorageUtils.SAVED_WINDOWS];
        const layoutState = data[ChromeStorageUtils.SAVED_WINDOWS_LAYOUT_STATE];
        if (savedWindows && layoutState) {
          resolve(new SessionListState(savedWindows, layoutState));
        } else {
          resolve(SessionListState.empty());
        }
      });
    });
  }

  static getSavedWindowsStateSync(): Promise<SessionListState> {
    return new Promise<SessionListState>(resolve => {
      chrome.storage.sync.get(data => {
        const layoutState: SessionListLayoutState = data[ChromeStorageUtils.SAVED_WINDOWS_LAYOUT_STATE];
        if (layoutState) {
          // todo: move to utils
          const savedSessions = {};
          layoutState.sessionStates
            .map(sessionState => sessionState.sessionId)
            .forEach(sessionId => savedSessions[sessionId] = data[sessionId]);
          resolve(new SessionListState(savedSessions, layoutState));
        } else {
          resolve(SessionListState.empty());
        }
      });
    });
  }

  static setSavedWindowsStateLocal(sessionListState: SessionListState) {
    chrome.storage.local.set({
      [ChromeStorageUtils.SAVED_WINDOWS]: sessionListState.chromeSessions,
      [ChromeStorageUtils.SAVED_WINDOWS_LAYOUT_STATE]: sessionListState.layoutState
    }, () => {
      MessagePassingService.notifySavedWindowStateListeners();
    });
  }

  static setSavedWindowsStateSync(sessionListState: SessionListState) {
    ChromeStorageUtils.getSavedWindowsStateSync().then(oldSessionListState => {
      const removedSessionIds = oldSessionListState.layoutState.sessionStates
        .map(layoutState => layoutState.sessionId)
        .filter(sessionId => !sessionListState.chromeSessions[sessionId]);
      chrome.storage.sync.remove(removedSessionIds);
      chrome.storage.sync.set({
        ...sessionListState.chromeSessions,
        [ChromeStorageUtils.SAVED_WINDOWS_LAYOUT_STATE]: sessionListState.layoutState
      }, () => {
        MessagePassingService.notifySavedWindowStateListeners();
      });
    });
  }

  static getActiveWindowsState(): Promise<SessionListState> {
    return new Promise<SessionListState>(resolve => {
      chrome.storage.local.get([ChromeStorageUtils.ACTIVE_WINDOWS, ChromeStorageUtils.ACTIVE_WINDOWS_LAYOUT_STATE], data => {
        const activeWindows = data[ChromeStorageUtils.ACTIVE_WINDOWS];
        const layoutState = data[ChromeStorageUtils.ACTIVE_WINDOWS_LAYOUT_STATE];
        if (activeWindows && layoutState) {
          resolve(new SessionListState(activeWindows, layoutState));
        } else {
          resolve(SessionListState.empty());
        }
      });
    });
  }

  static setActiveWindowsState(sessionListState: SessionListState, callback?: () => void) {
    chrome.storage.local.set({
      [ChromeStorageUtils.ACTIVE_WINDOWS]: sessionListState.chromeSessions,
      [ChromeStorageUtils.ACTIVE_WINDOWS_LAYOUT_STATE]: sessionListState.layoutState
    }, () => {
      MessagePassingService.notifyActiveWindowStateListeners();
      if (callback) {
        callback();
      }
    });
  }

  static getActiveWindowsLayoutState(): Promise<SessionListLayoutState> {
    return new Promise<SessionListLayoutState>(resolve => {
      chrome.storage.local.get(ChromeStorageUtils.ACTIVE_WINDOWS_LAYOUT_STATE, data => {
        const layoutState = data[ChromeStorageUtils.ACTIVE_WINDOWS_LAYOUT_STATE];
        if (layoutState) {
          resolve(layoutState);
        } else {
          resolve(SessionListUtils.createEmptyListLayoutState());
        }
      });
    });
  }

  static getRecentlyClosedSessionsState(): Promise<SessionListState> {
    return new Promise<SessionListState>(resolve => {
      chrome.storage.local.get([ChromeStorageUtils.RECENTLY_CLOSED_SESSIONS, ChromeStorageUtils.RECENTLY_CLOSED_SESSIONS_LAYOUT_STATE], data => {
        const recentlyClosedSessions = data[ChromeStorageUtils.RECENTLY_CLOSED_SESSIONS];
        const layoutState = data[ChromeStorageUtils.RECENTLY_CLOSED_SESSIONS_LAYOUT_STATE];
        if (recentlyClosedSessions && layoutState) {
          resolve(new SessionListState(recentlyClosedSessions, layoutState));
        } else {
          resolve(SessionListState.empty());
        }
      });
    });
  }

  static setRecentlyClosedSessionsState(sessionListState: SessionListState) {
    chrome.storage.local.set({
      [ChromeStorageUtils.RECENTLY_CLOSED_SESSIONS]: sessionListState.chromeSessions,
      [ChromeStorageUtils.RECENTLY_CLOSED_SESSIONS_LAYOUT_STATE]: sessionListState.layoutState
    }, () => {
      MessagePassingService.notifyClosedSessionStateListeners();
    });
  }

  static getPreferences(): Promise<Preferences> {
    return new Promise<Preferences>(resolve => {
      chrome.storage.sync.get({
        [ChromeStorageUtils.PREFERENCES]: PreferenceUtils.createDefaultPreferences()
      }, data => {
        resolve(data[ChromeStorageUtils.PREFERENCES]);
      });
    });
  }

  static setPreferences(preferences: Preferences) {
    chrome.storage.sync.set({
      [ChromeStorageUtils.PREFERENCES]: preferences
    }, () => {
      MessagePassingService.notifyPreferenceListeners();
    });
  }

  static getSyncBytesInUse(): Promise<number> {
    return new Promise<number>(resolve => {
      chrome.storage.sync.getBytesInUse(bytesInUse => resolve(bytesInUse));
    });
  }

  static addSyncStorageOnChangedListener(callback: () => void) {
    chrome.storage.onChanged.addListener((changes, areaName) => {
      if (areaName === 'sync') {
        callback();
      }
    });
  }
}
