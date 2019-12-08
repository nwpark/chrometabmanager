import {Injectable} from '@angular/core';
import {SessionListState} from '../types/session-list-state';
import {PreferencesService} from './preferences.service';
import {ChromeStorageUtils} from '../classes/chrome-storage-utils';
import {Preferences} from '../types/preferences';
import {Subject} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class StorageService {

  syncBytesInUse = new Subject<number>();
  syncBytesInUse$ = this.syncBytesInUse.asObservable();

  constructor(private preferencesService: PreferencesService) {
    ChromeStorageUtils.addSyncStorageOnChangedListener(() => {
      this.refreshState();
    });
    this.refreshState();
  }

  private refreshState() {
    ChromeStorageUtils.getSyncBytesInUse().then(syncBytesInUse => {
      this.syncBytesInUse.next(syncBytesInUse);
    });
  }

  getSavedWindowsState(): Promise<SessionListState> {
    return Promise.all([
      this.preferencesService.getPreferences(),
      ChromeStorageUtils.getSavedWindowsStateSync(),
      ChromeStorageUtils.getSavedWindowsStateLocal()
    ]).then(res => {
      const preferences: Preferences = res[0];
      return preferences.syncSavedWindows ? res[1] : res[2];
    });
  }

  setSavedWindowsState(sessionListState: SessionListState) {
    this.preferencesService.getPreferences().then(preferences => {
      if (preferences.syncSavedWindows) {
        ChromeStorageUtils.setSavedWindowsStateSync(sessionListState);
      } else {
        ChromeStorageUtils.setSavedWindowsStateLocal(sessionListState);
      }
    });
  }
}
