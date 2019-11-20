import {Injectable} from '@angular/core';
import {WindowListLayoutState, WindowListState, WindowListUtils} from '../types/chrome-a-p-i-window-state';
import {environment} from '../../environments/environment';
import {MOCK_SAVED_WINDOWS} from './mock-windows';

declare var chrome;

@Injectable({
  providedIn: 'root'
})
export class StorageService {

  constructor() { }

  getSavedWindowsState(): Promise<WindowListState> {
    if (!environment.production) {
      return Promise.resolve(new WindowListState(MOCK_SAVED_WINDOWS, WindowListUtils.getDefaultLayoutState()));
    }
    return new Promise<WindowListState>(resolve => {
      const storageKey = {
        savedWindows: WindowListUtils.getDefaultAPIWindows(),
        savedWindowsLayoutState: WindowListUtils.getDefaultLayoutState()
      };
      chrome.storage.sync.get(storageKey, data => {
        const windowList = new WindowListState(data.savedWindows, data.savedWindowsLayoutState);
        resolve(windowList);
      });
    });
  }

  setSavedWindowsState(windowListState: WindowListState) {
    if (environment.production) {
      chrome.storage.sync.set({
        savedWindows: windowListState.chromeAPIWindows,
        savedWindowsLayoutState: windowListState.layoutState
      });
    }
  }

  getChromeWindowsLayoutState(): WindowListLayoutState {
    const layoutState = localStorage.getItem('activeWindowsLayoutState');
    return JSON.parse(layoutState) || WindowListUtils.getDefaultLayoutState();
  }

  setChromeWindowsLayoutState(windowListLayoutState: WindowListLayoutState) {
    localStorage.setItem('activeWindowsLayoutState', JSON.stringify(windowListLayoutState));
  }
}
