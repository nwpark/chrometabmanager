import {Injectable} from '@angular/core';
import {SessionListState} from '../types/session-list-state';
import {PreferencesService} from './preferences.service';
import {ChromeStorageUtils} from '../classes/chrome-storage-utils';
import {Preferences} from '../types/preferences';
import {Subject} from 'rxjs';
import {v4 as uuid} from 'uuid';
import {MessagePassingService} from './message-passing.service';

@Injectable({
  providedIn: 'root'
})
export class StorageService {

  readonly instanceId: string;
  syncBytesInUse = new Subject<number>();
  syncBytesInUse$ = this.syncBytesInUse.asObservable();

  constructor(private preferencesService: PreferencesService) {
    this.instanceId = uuid();
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
        // ChromeStorageUtils.setSavedWindowsStateSync(sessionListState);
        this.setSavedWindowsStateSync(sessionListState);
      } else {
        ChromeStorageUtils.setSavedWindowsStateLocal(sessionListState);
      }
    });
  }

  setSavedWindowsStateSync(sessionListState: SessionListState) {
    ChromeStorageUtils.getSavedWindowsStateSync().then(oldSessionListState => {
      const removedSessionIds = oldSessionListState.layoutState.sessionStates
        .map(layoutState => layoutState.sessionId)
        .filter(sessionId => !sessionListState.chromeSessions[sessionId]);
      chrome.storage.sync.set({
        [ChromeStorageUtils.LAST_MODIFIED_BY]: this.instanceId,
        ...sessionListState.chromeSessions,
        [ChromeStorageUtils.SAVED_WINDOWS_LAYOUT_STATE]: sessionListState.layoutState
      }, () => {
        chrome.storage.sync.remove(removedSessionIds);
        MessagePassingService.notifySavedWindowStateListeners();
      });
    });
  }

  removeSavedSessionFromSync(sessionId: any) {
    this.preferencesService.getPreferences().then(preferences => {
      if (preferences.syncSavedWindows) {
        chrome.storage.sync.remove(sessionId);
      }
    });
  }
}
