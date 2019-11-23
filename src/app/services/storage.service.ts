import {Injectable} from '@angular/core';
import {WindowListLayoutState, WindowListState, WindowListUtils} from '../types/window-list-state';
import {environment} from '../../environments/environment';
import {MOCK_SAVED_WINDOWS} from './mock-windows';
import {RecentlyClosedSession, SessionListState, SessionListUtils} from '../types/closed-session-list-state';
import {ChromeAPIWindowState} from '../types/chrome-api-types';

@Injectable({
  providedIn: 'root'
})
export class StorageService {

  static readonly SAVED_WINDOWS = 'savedWindows';
  static readonly SAVED_WINDOWS_LAYOUT_STATE = 'savedWindowsLayoutState';
  static readonly ACTIVE_WINDOWS_LAYOUT_STATE = 'activeWindowsLayoutState';
  static readonly RECENTLY_CLOSED_SESSIONS = 'recentlyClosedSessions';
  static readonly RECENTLY_CLOSED_SESSIONS_LAYOUT_STATE = 'recentlyClosedSessionsLayoutState';

  constructor() { }

  getSavedWindowsState(): Promise<WindowListState> {
    if (!environment.production) {
      return Promise.resolve(new WindowListState(MOCK_SAVED_WINDOWS, WindowListUtils.createBasicListLayoutState(MOCK_SAVED_WINDOWS)));
    }
    return new Promise<WindowListState>(resolve => {
      chrome.storage.local.get([StorageService.SAVED_WINDOWS, StorageService.SAVED_WINDOWS_LAYOUT_STATE], data => {
        // todo: check for layout state
        if (data[StorageService.SAVED_WINDOWS]) {
          resolve(new WindowListState(data[StorageService.SAVED_WINDOWS], data[StorageService.SAVED_WINDOWS_LAYOUT_STATE]));
        } else {
          resolve(WindowListUtils.createEmptyWindowListState());
        }
      });
    });
  }

  setSavedWindowsState(windowListState: WindowListState) {
    if (environment.production) {
      const windowListData = {};
      windowListData[StorageService.SAVED_WINDOWS] = windowListState.chromeAPIWindows;
      windowListData[StorageService.SAVED_WINDOWS_LAYOUT_STATE] = windowListState.layoutState;
      chrome.storage.local.set(windowListData);
    }
  }

  getChromeWindowsLayoutState(chromeAPIWindows: ChromeAPIWindowState[]): WindowListLayoutState {
    const layoutState = JSON.parse(localStorage.getItem(StorageService.ACTIVE_WINDOWS_LAYOUT_STATE));
    if (layoutState) {
      return WindowListUtils.cleanupLayoutState(layoutState, chromeAPIWindows);
    }
    return WindowListUtils.createBasicListLayoutState(chromeAPIWindows);
  }

  setChromeWindowsLayoutState(windowListLayoutState: WindowListLayoutState) {
    localStorage.setItem(StorageService.ACTIVE_WINDOWS_LAYOUT_STATE, JSON.stringify(windowListLayoutState));
  }

  getRecentlyClosedSessionsState(): Promise<SessionListState> {
    return new Promise<SessionListState>(resolve => {
      chrome.storage.local.get([StorageService.RECENTLY_CLOSED_SESSIONS, StorageService.RECENTLY_CLOSED_SESSIONS_LAYOUT_STATE], data => {
        const recentlyClosedSessions = data[StorageService.RECENTLY_CLOSED_SESSIONS] as RecentlyClosedSession[];
        const layoutState = data[StorageService.RECENTLY_CLOSED_SESSIONS_LAYOUT_STATE] as WindowListLayoutState;
        if (recentlyClosedSessions) {
          const closedWindows = SessionListUtils.getClosedWindows(recentlyClosedSessions);
          if (layoutState) {
            resolve(new SessionListState(recentlyClosedSessions, SessionListUtils.cleanupLayoutState(layoutState, closedWindows)));
          } else {
            resolve(new SessionListState(recentlyClosedSessions, SessionListUtils.createBasicListLayoutState(closedWindows)));
          }
        } else {
          resolve(new SessionListState([], WindowListUtils.createEmptyListLayoutState()));
        }
      });
    });
  }

  setRecentlyClosedSessionsState(sessionListState: SessionListState) {
    const writeData = {};
    writeData[StorageService.RECENTLY_CLOSED_SESSIONS] = sessionListState.recentlyClosedSessions;
    writeData[StorageService.RECENTLY_CLOSED_SESSIONS_LAYOUT_STATE] = sessionListState.layoutState;
    chrome.storage.local.set(writeData);
  }

  addClosedSessionListener(callback: (closedSessions: RecentlyClosedSession[]) => void) {
    chrome.storage.onChanged.addListener((changes, areaName) => {
      if (changes.recentlyClosedSessions) {
        const closedSessions = changes.recentlyClosedSessions.newValue as RecentlyClosedSession[];
        callback(closedSessions);
      }
    });
  }
}
