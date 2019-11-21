import {Injectable} from '@angular/core';
import {
  ChromeAPIWindowState,
  RecentlyClosedSession,
  WindowListLayoutState,
  WindowListState,
  WindowListUtils
} from '../types/chrome-a-p-i-window-state';
import {environment} from '../../environments/environment';
import {MOCK_SAVED_WINDOWS} from './mock-windows';

@Injectable({
  providedIn: 'root'
})
export class StorageService {

  static readonly SAVED_WINDOWS = 'savedWindows';
  static readonly SAVED_WINDOWS_LAYOUT_STATE = 'savedWindowsLayoutState';
  static readonly ACTIVE_WINDOWS_LAYOUT_STATE = 'activeWindowsLayoutState';
  static readonly RECENTLY_CLOSED_SESSIONS = 'recentlyClosedSessions';
  static readonly RECENTLY_CLOSED_WINDOWS = 'recentlyClosedWindows';
  static readonly RECENTLY_CLOSED_WINDOWS_LAYOUT_STATE = 'recentlyClosedWindowsLayoutState';

  constructor() { }

  getSavedWindowsState(): Promise<WindowListState> {
    if (!environment.production) {
      return Promise.resolve(new WindowListState(MOCK_SAVED_WINDOWS, WindowListUtils.createBasicListLayoutState(MOCK_SAVED_WINDOWS)));
    }
    return new Promise<WindowListState>(resolve => {
      chrome.storage.local.get([StorageService.SAVED_WINDOWS, StorageService.SAVED_WINDOWS_LAYOUT_STATE], data => {
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

  getRecentlyClosedWindowsState(): Promise<WindowListState> {
    return this.getWindowListState(StorageService.RECENTLY_CLOSED_WINDOWS, StorageService.RECENTLY_CLOSED_WINDOWS_LAYOUT_STATE);
  }

  setRecentlyClosedWindowsState(windowListState: WindowListState) {
    this.setWindowListState(windowListState, StorageService.RECENTLY_CLOSED_WINDOWS, StorageService.RECENTLY_CLOSED_WINDOWS_LAYOUT_STATE);
  }

  getRecentlyClosedSessions(): Promise<RecentlyClosedSession[]> {
    return new Promise<RecentlyClosedSession[]>(resolve => {
      chrome.storage.local.get(StorageService.RECENTLY_CLOSED_SESSIONS, data => {
        if (data[StorageService.RECENTLY_CLOSED_SESSIONS]) {
          resolve(data[StorageService.RECENTLY_CLOSED_SESSIONS]);
        } else {
          resolve([]);
        }
      });
    });
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

  getWindowListState(chromeAPIWindowsKey: string, layoutStateKey: string): Promise<WindowListState> {
    if (!environment.production) {
      return Promise.resolve(new WindowListState(MOCK_SAVED_WINDOWS, WindowListUtils.createBasicListLayoutState(MOCK_SAVED_WINDOWS)));
    }
    return new Promise<WindowListState>(resolve => {
      chrome.storage.local.get([chromeAPIWindowsKey, layoutStateKey], data => {
        if (data[chromeAPIWindowsKey] && data[layoutStateKey]) {
          // todo: cleanup layoutstate
          resolve(new WindowListState(data[chromeAPIWindowsKey], data[layoutStateKey]));
        } else if (data[chromeAPIWindowsKey]) {
          const layoutState = WindowListUtils.createBasicListLayoutState(data[chromeAPIWindowsKey]);
          resolve(new WindowListState(data[chromeAPIWindowsKey], layoutState));
        } else {
          resolve(WindowListUtils.createEmptyWindowListState());
        }
      });
    });
  }

  setWindowListState(windowListState: WindowListState, chromeAPIWindowsKey: string, layoutStateKey: string) {
    if (environment.production) {
      const windowListData = {};
      windowListData[chromeAPIWindowsKey] = windowListState.chromeAPIWindows;
      windowListData[layoutStateKey] = windowListState.layoutState;
      chrome.storage.local.set(windowListData);
    }
  }
}
