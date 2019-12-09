import {Injectable} from '@angular/core';
import {SessionListState} from '../types/session-list-state';
import {PreferencesService} from './preferences.service';
import {Preferences} from '../types/preferences';
import {SyncStorageService} from './sync-storage.service';
import {LocalStorageService} from './local-storage.service';
import {SessionListUtils} from '../classes/session-list-utils';

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

  setSavedWindowsState(sessionListState: SessionListState) {
    this.preferencesService.getPreferences().then(preferences => {
      if (preferences.syncSavedWindows) {
        this.syncStorageService.setSavedWindowsState(sessionListState);
      } else {
        this.localStorageService.setSavedWindowsState(sessionListState);
      }
    });
  }

  addSavedSessionsChangedListener(callback: () => void) {
    this.preferencesService.getPreferences().then(preferences => {
      if (preferences.syncSavedWindows) {
        this.syncStorageService.addSavedSessionsChangedListener(callback);
      } else {
        this.localStorageService.addSavedSessionsChangedListener(callback);
      }
    });
  }

  copyLocalDataToSync() {
    Promise.all([
      this.syncStorageService.getSavedWindowsState(),
      this.localStorageService.getSavedWindowsState()
    ]).then(res => {
      const sessionListState = SessionListUtils.mergeSessionLists(res[0], res[1]);
      this.syncStorageService.setSavedWindowsState(sessionListState);
    });
  }

  copySyncDataToLocal() {
    this.syncStorageService.getSavedWindowsState().then(sessionListState => {
      this.localStorageService.setSavedWindowsState(sessionListState);
    });
  }
}
