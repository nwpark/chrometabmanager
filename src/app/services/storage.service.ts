import {Injectable} from '@angular/core';
import {ChromeAPIWindowState, WindowListLayoutState, WindowListState, WindowListUtils} from '../types/chrome-a-p-i-window-state';
import {environment} from '../../environments/environment';
import {MOCK_SAVED_WINDOWS} from './mock-windows';

declare var chrome;

@Injectable({
  providedIn: 'root'
})
export class StorageService {

  static readonly SAVED_WINDOWS = 'savedWindows';
  static readonly SAVED_WINDOWS_LAYOUT_STATE = 'savedWindowsLayoutState';
  static readonly ACTIVE_WINDOWS_LAYOUT_STATE = 'activeWindowsLayoutState';

  constructor() { }

  getSavedWindowsState(): Promise<WindowListState> {
    if (!environment.production) {
      return Promise.resolve(new WindowListState(MOCK_SAVED_WINDOWS, WindowListUtils.createBasicListLayoutState(MOCK_SAVED_WINDOWS)));
    }
    return new Promise<WindowListState>(resolve => {
      chrome.storage.sync.get([StorageService.SAVED_WINDOWS, StorageService.SAVED_WINDOWS_LAYOUT_STATE], data => {
        if (data.savedWindows) {
          resolve(new WindowListState(data.savedWindows, data.savedWindowsLayoutState));
        }
        resolve(WindowListUtils.createEmptyWindowListState());
      });
    });
  }

  setSavedWindowsState(windowListState: WindowListState) {
    if (environment.production) {
      const windowListData = {};
      windowListData[StorageService.SAVED_WINDOWS] = windowListState.chromeAPIWindows;
      windowListData[StorageService.SAVED_WINDOWS_LAYOUT_STATE] = windowListState.layoutState;
      chrome.storage.sync.set(windowListData);
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
}
