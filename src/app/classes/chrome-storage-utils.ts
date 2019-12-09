import {SessionListLayoutState, SessionListState, SessionListUtils} from '../types/session-list-state';
import {MessagePassingService} from '../services/message-passing.service';

export class ChromeStorageUtils {

  static readonly SAVED_WINDOWS = 'savedWindowsStorage_0a565f6f';
  static readonly SAVED_WINDOWS_LAYOUT_STATE = 'savedWindowsLayoutStateStorage_00adb476';
  static readonly ACTIVE_WINDOWS = 'activeWindowsStorage_2e062a09';
  static readonly ACTIVE_WINDOWS_LAYOUT_STATE = 'activeWindowsLayoutStateStorage_41b6b427';
  static readonly RECENTLY_CLOSED_SESSIONS = 'closedSessionsStorage_882c0c64';
  static readonly RECENTLY_CLOSED_SESSIONS_LAYOUT_STATE = 'closedSessionsLayoutStateStorage_b120de96';
  static readonly PREFERENCES = 'preferencesStorage_166b6914';
  static readonly LAST_MODIFIED_BY = 'lastModifiedBy_1266a87e';

  static getSavedWindowsStateLocal(): Promise<SessionListState> {
    return new Promise<SessionListState>(resolve => {
      chrome.storage.local.get([
        ChromeStorageUtils.SAVED_WINDOWS,
        ChromeStorageUtils.SAVED_WINDOWS_LAYOUT_STATE
      ], data => {
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

  static setSavedWindowsStateLocal(sessionListState: SessionListState) {
    chrome.storage.local.set({
      [ChromeStorageUtils.SAVED_WINDOWS]: sessionListState.chromeSessions,
      [ChromeStorageUtils.SAVED_WINDOWS_LAYOUT_STATE]: sessionListState.layoutState
    }, () => {
      MessagePassingService.notifySavedWindowStateListeners();
    });
  }

  static getActiveWindowsState(): Promise<SessionListState> {
    return new Promise<SessionListState>(resolve => {
      chrome.storage.local.get([
        ChromeStorageUtils.ACTIVE_WINDOWS,
        ChromeStorageUtils.ACTIVE_WINDOWS_LAYOUT_STATE
      ], data => {
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
      chrome.storage.local.get([
        ChromeStorageUtils.RECENTLY_CLOSED_SESSIONS,
        ChromeStorageUtils.RECENTLY_CLOSED_SESSIONS_LAYOUT_STATE
      ], data => {
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

  static getLocalSavedSessionsBytesInUse(): Promise<number> {
    return new Promise<number>(resolve => {
      chrome.storage.local.getBytesInUse([
        ChromeStorageUtils.SAVED_WINDOWS,
        ChromeStorageUtils.SAVED_WINDOWS_LAYOUT_STATE
      ], bytesInUse => {
        resolve(bytesInUse);
      });
    });
  }
}
