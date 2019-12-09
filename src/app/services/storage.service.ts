import {Injectable} from '@angular/core';
import {SessionListState} from '../types/session-list-state';
import {PreferencesService} from './preferences.service';
import {ChromeStorageUtils} from '../classes/chrome-storage-utils';
import {Preferences} from '../types/preferences';
import {SyncStorageService} from './sync-storage.service';
import {MessagePassingService} from './message-passing.service';

@Injectable({
  providedIn: 'root'
})
export class StorageService {

  constructor(private preferencesService: PreferencesService,
              private syncStorageService: SyncStorageService) { }

  getSavedWindowsState(): Promise<SessionListState> {
    return Promise.all([
      this.preferencesService.getPreferences(),
      this.syncStorageService.getSavedWindowsStateSync(),
      ChromeStorageUtils.getSavedWindowsStateLocal()
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
        ChromeStorageUtils.setSavedWindowsStateLocal(sessionListState);
      }
    });
  }

  addSavedSessionsChangedListener(callback: () => void) {
    this.preferencesService.getPreferences().then(preferences => {
      if (preferences.syncSavedWindows) {
        this.syncStorageService.addSavedSessionsChangedListener(callback);
      } else {
        MessagePassingService.addSavedWindowStateListener(callback);
      }
    });
  }
}
