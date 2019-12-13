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
        const activeWindows = data[StorageKeys.ActiveWindows];
        const layoutState = data[StorageKeys.ActiveWindowsLayoutState];
        if (activeWindows && layoutState) {
          resolve(new SessionListState(activeWindows, layoutState));
        } else {
          resolve(SessionListState.empty());
        }
      });
    });
  }

  setActiveWindowsState(sessionListState: SessionListState, callback?: () => void) {
    chrome.storage.local.set({
      [StorageKeys.ActiveWindows]: sessionListState.chromeSessions,
      [StorageKeys.ActiveWindowsLayoutState]: sessionListState.layoutState
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
        const recentlyClosedSessions = data[StorageKeys.RecentlyClosedSessions];
        const layoutState = data[StorageKeys.RecentlyClosedSessionsLayoutState];
        if (recentlyClosedSessions && layoutState) {
          resolve(SessionListState.fromSessionStates(recentlyClosedSessions, layoutState));
        } else {
          resolve(SessionListState.empty());
        }
      });
    });
  }

  setRecentlyClosedSessionsState(sessionListState: SessionListState) {
    chrome.storage.local.set({
      [StorageKeys.RecentlyClosedSessions]: sessionListState.getSessionStates(),
      [StorageKeys.RecentlyClosedSessionsLayoutState]: sessionListState.layoutState
    }, () => {
      MessagePassingService.notifyClosedSessionStateListeners();
    });
  }

  getSavedWindowsState(): Promise<SessionListState> {
    return new Promise<SessionListState>(resolve => {
      chrome.storage.local.get([
        StorageKeys.SavedSessions,
        StorageKeys.SavedWindowsLayoutState
      ], data => {
        const savedSessions = data[StorageKeys.SavedSessions];
        const layoutState = data[StorageKeys.SavedWindowsLayoutState];
        if (savedSessions && layoutState) {
          resolve(SessionListState.fromSessionStates(savedSessions, layoutState));
        } else {
          resolve(SessionListState.empty());
        }
      });
    });
  }

  setSavedWindowsState(sessionListState: SessionListState) {
    chrome.storage.local.set({
      [StorageKeys.SavedSessions]: sessionListState.getSessionStates(),
      [StorageKeys.SavedWindowsLayoutState]: sessionListState.layoutState
    }, () => {
      MessagePassingService.notifySavedWindowStateListeners();
    });
  }

  addSavedSessionsChangedListener(callback: () => void) {
    MessagePassingService.addSavedWindowStateListener(callback);
  }
}
