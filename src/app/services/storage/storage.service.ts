import {Injectable} from '@angular/core';
import {SessionListState} from '../../types/session/session-list-state';
import {PreferencesService} from '../preferences.service';
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
    const savedWindowsStateSync$ = this.syncStorageService.getSavedWindowsState();
    const savedWindowsStateLocal$ = this.localStorageService.getSavedWindowsState();
    return this.preferencesService.getPreferences().then(preferences =>
      preferences.syncSavedWindows ? savedWindowsStateSync$ : savedWindowsStateLocal$
    );
  }

  setSavedWindowsState(sessionListState: SessionListState, removedSessionIds?: SessionId[]): Promise<void> {
    return this.preferencesService.getPreferences().then(preferences =>
      preferences.syncSavedWindows
        ? this.syncStorageService.setSavedWindowsState(sessionListState, removedSessionIds)
        : this.localStorageService.setSavedWindowsState(sessionListState)
    );
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
