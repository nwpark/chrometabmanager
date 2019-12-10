import {Injectable} from '@angular/core';
import {SessionListState} from '../types/session-list-state';
import {v4 as uuid} from 'uuid';
import {Subject} from 'rxjs';
import {Preferences, PreferenceUtils} from '../types/preferences';
import {SessionListLayoutState} from '../types/session';
import {SessionListUtils} from '../classes/session-list-utils';
import {StorageKeys} from '../types/storage-keys';

@Injectable({
  providedIn: 'root'
})
export class SyncStorageService {

  readonly instanceId: string;

  bytesInUse = new Subject<number>();
  bytesInUse$ = this.bytesInUse.asObservable();

  constructor() {
    this.instanceId = uuid();
    this.addOnChangedListener(() => {
      this.refreshState();
    });
    this.refreshState();
  }

  private refreshState() {
    chrome.storage.sync.getBytesInUse(bytesInUse => {
      this.bytesInUse.next(bytesInUse);
    });
  }

  getPreferences(): Promise<Preferences> {
    return new Promise<Preferences>(resolve => {
      chrome.storage.sync.get({
        [StorageKeys.Preferences]: PreferenceUtils.createDefaultPreferences()
      }, data => {
        resolve(data[StorageKeys.Preferences]);
      });
    });
  }

  getSavedWindowsState(): Promise<SessionListState> {
    return new Promise<SessionListState>(resolve => {
      chrome.storage.sync.get(data => {
        const layoutState: SessionListLayoutState = data[StorageKeys.SavedWindowsLayoutState];
        if (layoutState) {
          const savedSessions = SessionListUtils.filterSessionMap(data, layoutState);
          resolve(new SessionListState(savedSessions, layoutState));
        } else {
          resolve(SessionListState.empty());
        }
      });
    });
  }

  setPreferences(preferences: Preferences) {
    chrome.storage.sync.set({
      [StorageKeys.LastModifiedBy]: this.instanceId,
      [StorageKeys.Preferences]: preferences
    });
  }

  setSavedWindowsState(sessionListState: SessionListState) {
    this.getSavedWindowsState().then(oldSessionListState => {
      const removedSessionIds = oldSessionListState.layoutState.sessionStates
        .map(layoutState => layoutState.sessionId)
        .filter(sessionId => !sessionListState.chromeSessions[sessionId]);
      chrome.storage.sync.set({
        [StorageKeys.LastModifiedBy]: this.instanceId,
        ...sessionListState.chromeSessions,
        [StorageKeys.SavedWindowsLayoutState]: sessionListState.layoutState
      }, () => {
        chrome.storage.sync.remove(removedSessionIds);
      });
    });
  }

  addPreferencesChangedListener(callback: () => void) {
    this.addExternalOnChangedListener(callback, StorageKeys.Preferences);
  }

  addSavedSessionsChangedListener(callback: () => void) {
    this.addExternalOnChangedListener(callback);
  }

  addExternalOnChangedListener(callback: () => void, key?: string) {
    chrome.storage.onChanged.addListener((changes, areaName) => {
      if (areaName === 'sync' && (!key || changes[key])) {
        chrome.storage.sync.get(StorageKeys.LastModifiedBy, data => {
          if (data[StorageKeys.LastModifiedBy] !== this.instanceId) {
            callback();
          }
        });
      }
    });
  }

  private addOnChangedListener(callback: () => void) {
    chrome.storage.onChanged.addListener((changes, areaName) => {
      if (areaName === 'sync') {
        callback();
      }
    });
  }
}
