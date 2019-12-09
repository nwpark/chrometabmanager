import { Injectable } from '@angular/core';
import {SessionListState} from '../types/session-list-state';
import {ChromeStorageUtils} from '../classes/chrome-storage-utils';
import {MessagePassingService} from './message-passing.service';

@Injectable({
  providedIn: 'root'
})
export class LocalStorageService {

  constructor() { }

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
      [ChromeStorageUtils.SAVED_WINDOWS]: sessionListState.chromeSessions,
      [ChromeStorageUtils.SAVED_WINDOWS_LAYOUT_STATE]: sessionListState.layoutState
    }, () => {
      MessagePassingService.notifySavedWindowStateListeners();
    });
  }
}
