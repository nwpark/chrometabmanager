import {Injectable} from '@angular/core';
import {WindowListLayoutState, WindowListState, WindowListUtils} from '../types/window-list-state';
import {RecentlyClosedSession, SessionListState} from '../types/session-list-state';
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

  setSavedWindowsState(windowListState: WindowListState) {
    const windowListData = {};
    windowListData[StorageService.SAVED_WINDOWS] = windowListState.chromeAPIWindows;
    windowListData[StorageService.SAVED_WINDOWS_LAYOUT_STATE] = windowListState.layoutState;
    chrome.storage.local.set(windowListData);
  }

  getChromeWindowsLayoutState(chromeAPIWindows: ChromeAPIWindowState[]): Promise<WindowListLayoutState> {
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

  setChromeWindowsLayoutState(windowListLayoutState: WindowListLayoutState) {
    const writeData = {};
    writeData[StorageService.ACTIVE_WINDOWS_LAYOUT_STATE] = windowListLayoutState;
    chrome.storage.local.set(writeData);
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

  setRecentlyClosedSessionsState(sessionListState: SessionListState) {
    const writeData = {};
    writeData[StorageService.RECENTLY_CLOSED_SESSIONS] = sessionListState.recentlyClosedSessions;
    writeData[StorageService.RECENTLY_CLOSED_SESSIONS_LAYOUT_STATE] = sessionListState.layoutState;
    chrome.storage.local.set(writeData);
  }
}
