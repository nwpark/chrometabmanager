import {Injectable} from '@angular/core';
import {SessionListState} from '../../types/session-list-state';
import {MessagePassingService} from '../messaging/message-passing.service';
import {SessionListLayoutState} from '../../types/session';
import {SessionListUtils} from '../../utils/session-list-utils';
import {StorageKeys} from './storage-keys';
import {MessageReceiverService} from '../messaging/message-receiver.service';

@Injectable({
  providedIn: 'root'
})
export class LocalStorageService {

  constructor(private messagePassingService: MessagePassingService,
              private messageReceiverService: MessageReceiverService) { }

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

  setActiveWindowsState(sessionListState: SessionListState): Promise<void> {
    return new Promise<void>(resolve => {
      chrome.storage.local.set({
        [StorageKeys.ActiveWindows]: sessionListState.getSessionMap(),
        [StorageKeys.ActiveWindowsLayoutState]: sessionListState.getLayoutState()
      }, () => {
        this.messagePassingService.broadcastActiveSessions(sessionListState);
        resolve();
      });
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

  setRecentlyClosedSessionsState(sessionListState: SessionListState): Promise<void> {
    return new Promise<void>(resolve => {
      chrome.storage.local.set({
        [StorageKeys.RecentlyClosedSessions]: sessionListState.getSessionMap(),
        [StorageKeys.RecentlyClosedSessionsLayoutState]: sessionListState.getLayoutState()
      }, () => {
        this.messagePassingService.broadcastClosedSessions(sessionListState);
        resolve();
      });
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
      this.messagePassingService.broadcastSavedSessions(sessionListState);
    });
  }
}
