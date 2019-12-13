import {Injectable} from '@angular/core';
import {SessionListState} from '../types/session-list-state';
import {v4 as uuid} from 'uuid';
import {Subject} from 'rxjs';
import {Preferences, PreferenceUtils} from '../types/preferences';
import {SessionListLayoutState} from '../types/session';
import {StorageKeys} from '../types/storage-keys';
import {SyncStorageUtils} from '../classes/sync-storage-utils';

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
          const sessionStates = SyncStorageUtils.getSessionStatesFromStorageData(data);
          SyncStorageUtils.mergeLayoutStates(layoutState, sessionStates);
          const sessionMap = SyncStorageUtils.createSessionMap(sessionStates);
          resolve(new SessionListState(sessionMap, layoutState));
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

  setSavedWindowsState(sessionListState: SessionListState, removedSessions?: any[]) {
    const sessionMap = SyncStorageUtils.convertToSessionStateMap(sessionListState);
    chrome.storage.sync.set({
      [StorageKeys.LastModifiedBy]: this.instanceId,
      ...sessionMap,
      [StorageKeys.SavedWindowsLayoutState]: sessionListState.layoutState
    }, () => {
      if (removedSessions) {
        chrome.storage.sync.remove(removedSessions);
      }
    });
  }

  addPreferencesChangedListener(callback: () => void) {
    this.addExternalOnChangedListener(callback, StorageKeys.Preferences);
  }

  addSavedSessionsChangedListener(callback: () => void) {
    this.addExternalOnChangedListener(callback);
  }

  addExternalOnChangedListener(callback: () => void, key?: string) {
    // @ts-ignore
    chrome.storage.sync.onChanged.addListener(changes => {
      if (!key || changes[key]) {
        chrome.storage.sync.get(StorageKeys.LastModifiedBy, data => {
          if (data[StorageKeys.LastModifiedBy] !== this.instanceId) {
            callback();
          }
        });
      }
    });
  }

  private addOnChangedListener(callback: () => void) {
    // @ts-ignore
    chrome.storage.sync.onChanged.addListener(callback);
  }
}
