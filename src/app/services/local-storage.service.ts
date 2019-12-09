import {Injectable} from '@angular/core';
import {SessionListState} from '../types/session-list-state';
import {ChromeStorageUtils} from '../classes/chrome-storage-utils';
import {v4 as uuid} from 'uuid';

@Injectable({
  providedIn: 'root'
})
export class LocalStorageService {

  readonly instanceId: string;

  constructor() {
    this.instanceId = uuid();
  }

  getSavedWindowsState(): Promise<SessionListState> {
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

  setSavedWindowsState(sessionListState: SessionListState) {
    chrome.storage.local.set({
      [ChromeStorageUtils.LAST_MODIFIED_BY]: this.instanceId,
      [ChromeStorageUtils.SAVED_WINDOWS]: sessionListState.chromeSessions,
      [ChromeStorageUtils.SAVED_WINDOWS_LAYOUT_STATE]: sessionListState.layoutState
    });
  }

  addSavedSessionsChangedListener(callback: () => void) {
    this.addExternalOnChangedListener(ChromeStorageUtils.SAVED_WINDOWS_LAYOUT_STATE, callback);
  }

  private addExternalOnChangedListener(key: string, callback: () => void) {
    chrome.storage.onChanged.addListener((changes, areaName) => {
      if (areaName === 'local' && changes[key]) {
        chrome.storage.local.get(ChromeStorageUtils.LAST_MODIFIED_BY, data => {
          if (data[ChromeStorageUtils.LAST_MODIFIED_BY] !== this.instanceId) {
            callback();
          }
        });
      }
    });
  }
}
