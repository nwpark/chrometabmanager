import {Injectable} from '@angular/core';
import {SessionListLayoutState, WindowListState, WindowListUtils} from '../types/window-list-state';
import {SessionListState} from '../types/session-list-state';
import {MessagePassingService} from './message-passing.service';
import {Preferences, PreferenceUtils} from '../types/preferences';
import {ChromeAPISession} from '../types/chrome-api-types';

@Injectable({
  providedIn: 'root'
})
export class StorageService {

  static readonly SAVED_WINDOWS = 'savedWindowsStorage_0a565f6f';
  static readonly SAVED_WINDOWS_LAYOUT_STATE = 'savedWindowsLayoutStateStorage_00adb476';
  static readonly ACTIVE_WINDOWS = 'activeWindowsStorage_2e062a09';
  static readonly ACTIVE_WINDOWS_LAYOUT_STATE = 'activeWindowsLayoutStateStorage_41b6b427';
  static readonly RECENTLY_CLOSED_SESSIONS = 'closedSessionsStorage_882c0c64';
  static readonly RECENTLY_CLOSED_SESSIONS_LAYOUT_STATE = 'closedSessionsLayoutStateStorage_b120de96';
  static readonly PREFERENCES = 'preferencesStorage_166b6914';

  constructor() { }

  static getSavedWindowsState(): Promise<SessionListState> {
    return new Promise<SessionListState>(resolve => {
      chrome.storage.local.get([StorageService.SAVED_WINDOWS, StorageService.SAVED_WINDOWS_LAYOUT_STATE], data => {
        const savedWindows = data[StorageService.SAVED_WINDOWS];
        const layoutState = data[StorageService.SAVED_WINDOWS_LAYOUT_STATE];
        if (savedWindows && layoutState) {
          resolve(new SessionListState(savedWindows, layoutState));
        } else {
          resolve(SessionListState.empty());
        }
      });
    });
  }

  static setSavedWindowsState(sessionListState: SessionListState) {
    chrome.storage.local.set({
      [StorageService.SAVED_WINDOWS]: sessionListState.chromeSessions,
      [StorageService.SAVED_WINDOWS_LAYOUT_STATE]: sessionListState.layoutState
    }, () => {
      MessagePassingService.notifySavedWindowStateListeners();
    });
  }

  static getActiveWindowsState(): Promise<SessionListState> {
    return new Promise<SessionListState>(resolve => {
      chrome.storage.local.get([StorageService.ACTIVE_WINDOWS, StorageService.ACTIVE_WINDOWS_LAYOUT_STATE], data => {
        const activeWindows = data[StorageService.ACTIVE_WINDOWS];
        const layoutState = data[StorageService.ACTIVE_WINDOWS_LAYOUT_STATE];
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
      [StorageService.ACTIVE_WINDOWS]: sessionListState.chromeSessions,
      [StorageService.ACTIVE_WINDOWS_LAYOUT_STATE]: sessionListState.layoutState
    }, () => {
      MessagePassingService.notifyActiveWindowStateListeners();
      if (callback) {
        callback();
      }
    });
  }

  static getActiveWindowsLayoutState(): Promise<SessionListLayoutState> {
    return new Promise<SessionListLayoutState>(resolve => {
      chrome.storage.local.get(StorageService.ACTIVE_WINDOWS_LAYOUT_STATE, data => {
        const layoutState = data[StorageService.ACTIVE_WINDOWS_LAYOUT_STATE];
        if (layoutState) {
          resolve(layoutState);
        } else {
          resolve(WindowListUtils.createEmptyListLayoutState());
        }
      });
    });
  }

  static getRecentlyClosedSessionsState(): Promise<SessionListState> {
    return new Promise<SessionListState>(resolve => {
      chrome.storage.local.get([StorageService.RECENTLY_CLOSED_SESSIONS, StorageService.RECENTLY_CLOSED_SESSIONS_LAYOUT_STATE], data => {
        const recentlyClosedSessions = data[StorageService.RECENTLY_CLOSED_SESSIONS] as ChromeAPISession[];
        const layoutState = data[StorageService.RECENTLY_CLOSED_SESSIONS_LAYOUT_STATE] as SessionListLayoutState;
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
      [StorageService.RECENTLY_CLOSED_SESSIONS]: sessionListState.chromeSessions,
      [StorageService.RECENTLY_CLOSED_SESSIONS_LAYOUT_STATE]: sessionListState.layoutState
    }, () => {
      MessagePassingService.notifyClosedSessionStateListeners();
    });
  }

  static getPreferences(): Promise<Preferences> {
    return new Promise<Preferences>(resolve => {
      chrome.storage.sync.get({
        [StorageService.PREFERENCES]: PreferenceUtils.createDefaultPreferences()
      }, data => {
        resolve(data[StorageService.PREFERENCES]);
      });
    });
  }

  static setPreferences(preferences: Preferences) {
    chrome.storage.sync.set({
      [StorageService.PREFERENCES]: preferences
    }, () => {
      MessagePassingService.notifyPreferenceListeners();
    });
  }
}
