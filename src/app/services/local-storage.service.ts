import {Injectable} from '@angular/core';
import {SessionListState} from '../types/session-list-state';
import {MessagePassingService} from './message-passing.service';
import {SessionListLayoutState} from '../types/session';
import {SessionListUtils} from '../classes/session-list-utils';
import {StorageKeys} from '../types/storage-keys';

@Injectable({
  providedIn: 'root'
})
export class LocalStorageService {

  constructor() { }

  getActiveWindowsState(): Promise<SessionListState> {
    return new Promise<SessionListState>(resolve => {
      chrome.storage.local.get([
        StorageKeys.ActiveWindows,
        StorageKeys.ActiveWindowsLayoutState
      ], data => {
        const sessionMap = data[StorageKeys.ActiveWindows];
        const layoutState = data[StorageKeys.ActiveWindowsLayoutState];
        if (sessionMap && layoutState) {
          resolve(SessionListState.fromSessionMap(sessionMap, layoutState));
        } else {
          resolve(SessionListState.empty());
        }
      });
    });
  }

  setActiveWindowsState(sessionListState: SessionListState, callback?: () => void) {
    chrome.storage.local.set({
      [StorageKeys.ActiveWindows]: sessionListState.getSessionMap(),
      [StorageKeys.ActiveWindowsLayoutState]: sessionListState.getLayoutState()
    }, () => {
      MessagePassingService.notifyActiveWindowStateListeners();
      if (callback) {
        callback();
      }
    });
  }

  getActiveWindowsLayoutState(): Promise<SessionListLayoutState> {
    return new Promise<SessionListLayoutState>(resolve => {
      chrome.storage.local.get(StorageKeys.ActiveWindowsLayoutState, data => {
        const layoutState = data[StorageKeys.ActiveWindowsLayoutState];
        if (layoutState) {
          resolve(layoutState);
        } else {
          resolve(SessionListUtils.createEmptyListLayoutState());
        }
      });
    });
  }

  getRecentlyClosedSessionsState(): Promise<SessionListState> {
    return new Promise<SessionListState>(resolve => {
      chrome.storage.local.get([
        StorageKeys.RecentlyClosedSessions,
        StorageKeys.RecentlyClosedSessionsLayoutState
      ], data => {
        const sessionMap = data[StorageKeys.RecentlyClosedSessions];
        const layoutState = data[StorageKeys.RecentlyClosedSessionsLayoutState];
        if (sessionMap && layoutState) {
          resolve(SessionListState.fromSessionMap(sessionMap, layoutState));
        } else {
          resolve(SessionListState.empty());
        }
      });
    });
  }

  setRecentlyClosedSessionsState(sessionListState: SessionListState) {
    chrome.storage.local.set({
      [StorageKeys.RecentlyClosedSessions]: sessionListState.getSessionMap(),
      [StorageKeys.RecentlyClosedSessionsLayoutState]: sessionListState.getLayoutState()
    }, () => {
      MessagePassingService.notifyClosedSessionStateListeners();
    });
  }

  getSavedWindowsState(): Promise<SessionListState> {
    return new Promise<SessionListState>(resolve => {
      chrome.storage.local.get([
        StorageKeys.SavedWindows,
        StorageKeys.SavedWindowsLayoutState
      ], data => {
        const sessionMap = data[StorageKeys.SavedWindows];
        const layoutState = data[StorageKeys.SavedWindowsLayoutState];
        if (sessionMap && layoutState) {
          resolve(SessionListState.fromSessionMap(sessionMap, layoutState));
        } else {
          resolve(SessionListState.empty());
        }
      });
    });
  }

  setSavedWindowsState(sessionListState: SessionListState) {
    chrome.storage.local.set({
      [StorageKeys.SavedWindows]: sessionListState.getSessionMap(),
      [StorageKeys.SavedWindowsLayoutState]: sessionListState.getLayoutState()
    }, () => {
      MessagePassingService.notifySavedWindowStateListeners();
    });
  }

  addSavedSessionsChangedListener(callback: () => void) {
    MessagePassingService.addSavedWindowStateListener(callback);
  }
}
