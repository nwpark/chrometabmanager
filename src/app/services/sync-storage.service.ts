import {Injectable} from '@angular/core';
import {SessionListLayoutState, SessionListState, SessionListUtils} from '../types/session-list-state';
import {ChromeStorageUtils} from '../classes/chrome-storage-utils';
import {v4 as uuid} from 'uuid';
import {Subject} from 'rxjs';
import {Preferences, PreferenceUtils} from '../types/preferences';

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
        [ChromeStorageUtils.PREFERENCES]: PreferenceUtils.createDefaultPreferences()
      }, data => {
        resolve(data[ChromeStorageUtils.PREFERENCES]);
      });
    });
  }

  getSavedWindowsState(): Promise<SessionListState> {
    return new Promise<SessionListState>(resolve => {
      chrome.storage.sync.get(data => {
        const layoutState: SessionListLayoutState = data[ChromeStorageUtils.SAVED_WINDOWS_LAYOUT_STATE];
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
      [ChromeStorageUtils.LAST_MODIFIED_BY]: this.instanceId,
      [ChromeStorageUtils.PREFERENCES]: preferences
    });
  }

  setSavedWindowsState(sessionListState: SessionListState) {
    this.getSavedWindowsState().then(oldSessionListState => {
      const removedSessionIds = oldSessionListState.layoutState.sessionStates
        .map(layoutState => layoutState.sessionId)
        .filter(sessionId => !sessionListState.chromeSessions[sessionId]);
      chrome.storage.sync.set({
        [ChromeStorageUtils.LAST_MODIFIED_BY]: this.instanceId,
        ...sessionListState.chromeSessions,
        [ChromeStorageUtils.SAVED_WINDOWS_LAYOUT_STATE]: sessionListState.layoutState
      }, () => {
        chrome.storage.sync.remove(removedSessionIds);
      });
    });
  }

  addPreferencesChangedListener(callback: () => void) {
    this.addExternalOnChangedListener(ChromeStorageUtils.PREFERENCES, callback);
  }

  addSavedSessionsChangedListener(callback: () => void) {
    this.addExternalOnChangedListener(ChromeStorageUtils.SAVED_WINDOWS_LAYOUT_STATE, callback);
  }

  private addExternalOnChangedListener(key: string, callback: () => void) {
    chrome.storage.onChanged.addListener((changes, areaName) => {
      if (areaName === 'sync' && changes[key]) {
        chrome.storage.sync.get(ChromeStorageUtils.LAST_MODIFIED_BY, data => {
          if (data[ChromeStorageUtils.LAST_MODIFIED_BY] !== this.instanceId) {
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
