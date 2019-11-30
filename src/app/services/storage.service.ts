import {Injectable} from '@angular/core';
import {WindowListLayoutState, WindowListState, WindowListUtils} from '../types/window-list-state';
import {RecentlyClosedSession, SessionListState} from '../types/session-list-state';
import {ChromeAPIWindowState} from '../types/chrome-api-types';
import {MessagePassingService} from './message-passing.service';

@Injectable({
  providedIn: 'root'
})
export class StorageService {

  static readonly SAVED_WINDOWS = 'savedWindowsStorage_0a565f6f';
  static readonly SAVED_WINDOWS_LAYOUT_STATE = 'savedWindowsLayoutStateStorage_00adb476';
  static readonly ACTIVE_WINDOWS_LAYOUT_STATE = 'activeWindowsLayoutStateStorage_41b6b427';
  static readonly RECENTLY_CLOSED_SESSIONS = 'closedSessionsStorage_882c0c64';
  static readonly RECENTLY_CLOSED_SESSIONS_LAYOUT_STATE = 'closedSessionsLayoutStateStorage_b120de96';

  constructor() { }

  static getSavedWindowsState(): Promise<WindowListState> {
    return new Promise<WindowListState>(resolve => {
      chrome.storage.local.get([StorageService.SAVED_WINDOWS, StorageService.SAVED_WINDOWS_LAYOUT_STATE], data => {
        const savedWindows = data[StorageService.SAVED_WINDOWS];
        const layoutState = data[StorageService.SAVED_WINDOWS_LAYOUT_STATE];
        if (savedWindows && layoutState) {
          resolve(new WindowListState(savedWindows, layoutState));
        } else {
          resolve(WindowListUtils.createEmptyWindowListState());
        }
      });
    });
  }

  static setSavedWindowsState(windowListState: WindowListState) {
    chrome.storage.local.set({
      [StorageService.SAVED_WINDOWS]: windowListState.chromeAPIWindows,
      [StorageService.SAVED_WINDOWS_LAYOUT_STATE]: windowListState.layoutState
    }, () => {
      MessagePassingService.notifySavedWindowStateListeners();
    });
  }

  static getChromeWindowsLayoutState(chromeAPIWindows: ChromeAPIWindowState[]): Promise<WindowListLayoutState> {
    return new Promise<WindowListLayoutState>(resolve => {
      chrome.storage.local.get(StorageService.ACTIVE_WINDOWS_LAYOUT_STATE, data => {
        const layoutState = data[StorageService.ACTIVE_WINDOWS_LAYOUT_STATE];
        if (layoutState) {
          resolve(WindowListUtils.cleanupLayoutState(layoutState, chromeAPIWindows));
        } else {
          resolve(WindowListUtils.createBasicListLayoutState(chromeAPIWindows));
        }
      });
    });
  }

  static setChromeWindowsLayoutState(windowListLayoutState: WindowListLayoutState) {
    chrome.storage.local.set({
      [StorageService.ACTIVE_WINDOWS_LAYOUT_STATE]: windowListLayoutState
    }, () => {
      MessagePassingService.notifyActiveWindowStateListeners();
    });
  }

  static getRecentlyClosedSessionsState(): Promise<SessionListState> {
    return new Promise<SessionListState>(resolve => {
      chrome.storage.local.get([StorageService.RECENTLY_CLOSED_SESSIONS, StorageService.RECENTLY_CLOSED_SESSIONS_LAYOUT_STATE], data => {
        const recentlyClosedSessions = data[StorageService.RECENTLY_CLOSED_SESSIONS] as RecentlyClosedSession[];
        const layoutState = data[StorageService.RECENTLY_CLOSED_SESSIONS_LAYOUT_STATE] as WindowListLayoutState;
        if (recentlyClosedSessions && layoutState) {
          resolve(new SessionListState(recentlyClosedSessions, layoutState));
        } else {
          resolve(new SessionListState([], WindowListUtils.createEmptyListLayoutState()));
        }
      });
    });
  }

  static setRecentlyClosedSessionsState(sessionListState: SessionListState) {
    chrome.storage.local.set({
      [StorageService.RECENTLY_CLOSED_SESSIONS]: sessionListState.recentlyClosedSessions,
      [StorageService.RECENTLY_CLOSED_SESSIONS_LAYOUT_STATE]: sessionListState.layoutState
    }, () => {
      MessagePassingService.notifyClosedSessionStateListeners();
    });
  }
}
