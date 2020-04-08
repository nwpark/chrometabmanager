import {Injectable} from '@angular/core';
import {SessionListState} from '../../types/session/session-list-state';
import {PreferencesService} from '../preferences.service';
import {LocalStorageService} from './local-storage.service';
import {from, Observable} from 'rxjs';
import {MessageReceiverService} from '../messaging/message-receiver.service';
import {switchMap} from 'rxjs/operators';
import {DriveStorageCacheService} from './drive-storage-cache.service';

@Injectable({
  providedIn: 'root'
})
export class StorageService {

  constructor(private preferencesService: PreferencesService,
              private localStorageService: LocalStorageService,
              private driveStorageCacheService: DriveStorageCacheService,
              private messageReceiverService: MessageReceiverService) { }

  getSavedWindowsState(): Promise<SessionListState> {
    const savedWindowsStateSync$ = this.driveStorageCacheService.getSavedWindowsState();
    const savedWindowsStateLocal$ = this.localStorageService.getSavedWindowsState();
    return this.preferencesService.getPreferences().then(preferences =>
      preferences.syncSavedWindows ? savedWindowsStateSync$ : savedWindowsStateLocal$
    );
  }

  setSavedWindowsState(sessionListState: SessionListState): Promise<void> {
    return this.preferencesService.getPreferences().then(preferences =>
      preferences.syncSavedWindows
        ? this.driveStorageCacheService.setSavedWindowsState(sessionListState)
        : this.localStorageService.setSavedWindowsState(sessionListState)
    );
  }

  savedSessionStateUpdated$(): Observable<SessionListState> {
    return from(this.preferencesService.getPreferences()).pipe(
      switchMap(preferences =>
        preferences.syncSavedWindows
          ? this.messageReceiverService.savedSessionStateSyncUpdated$
          : this.messageReceiverService.savedSessionStateUpdated$
      )
    );
  }

  clearStorage() {
    // todo: split into clear for each section
    chrome.storage.local.clear();
    chrome.storage.sync.clear();
    chrome.runtime.reload();
  }
}
