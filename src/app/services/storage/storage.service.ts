import {Injectable} from '@angular/core';
import {SessionListState} from '../../types/session/session-list-state';
import {PreferencesService} from '../preferences.service';
import {Preferences} from '../../types/preferences';
import {SyncStorageService} from './sync-storage.service';
import {LocalStorageService} from './local-storage.service';
import {SessionId} from '../../types/chrome-api/chrome-api-window-state';

@Injectable({
  providedIn: 'root'
})
export class StorageService {

  constructor(private preferencesService: PreferencesService,
              private syncStorageService: SyncStorageService,
              private localStorageService: LocalStorageService) { }

  getSavedWindowsState(): Promise<SessionListState> {
    return Promise.all([
      this.preferencesService.getPreferences(),
      this.syncStorageService.getSavedWindowsState(),
      this.localStorageService.getSavedWindowsState()
    ]).then(res => {
      const preferences: Preferences = res[0];
      return preferences.syncSavedWindows ? res[1] : res[2];
    });
  }

  setSavedWindowsState(sessionListState: SessionListState, removedSessionIds?: SessionId[]) {
    this.preferencesService.getPreferences().then(preferences => {
      if (preferences.syncSavedWindows) {
        this.syncStorageService.setSavedWindowsState(sessionListState, removedSessionIds);
      } else {
        this.localStorageService.setSavedWindowsState(sessionListState);
      }
    });
  }

  copyLocalDataToSync() {
    Promise.all([
      this.syncStorageService.getSavedWindowsState(),
      this.localStorageService.getSavedWindowsState()
    ]).then(res => {
      const sessionListState: SessionListState = res[0];
      sessionListState.addAll(res[1]);
      this.syncStorageService.setSavedWindowsState(sessionListState);
    });
  }

  copySyncDataToLocal() {
    Promise.all([
      this.localStorageService.getSavedWindowsState(),
      this.syncStorageService.getSavedWindowsState()
    ]).then(res => {
      const sessionListState: SessionListState = res[0];
      sessionListState.addAll(res[1]);
      this.localStorageService.setSavedWindowsState(sessionListState);
    });
  }

  clearStorage() {
    // todo: split into clear for each section
    chrome.storage.local.clear();
    chrome.storage.sync.clear();
    chrome.runtime.reload();
  }
}
