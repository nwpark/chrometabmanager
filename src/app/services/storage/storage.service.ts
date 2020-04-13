import {Injectable} from '@angular/core';
import {SessionListState} from '../../types/session/session-list-state';
import {PreferencesService} from '../preferences.service';
import {LocalStorageService} from './local-storage.service';
import {Observable} from 'rxjs';
import {MessageReceiverService} from '../messaging/message-receiver.service';
import {switchMap} from 'rxjs/operators';
import {DriveStorageService} from '../drive-api/drive-storage.service';
import {DriveAccountService} from '../drive-api/drive-account.service';

@Injectable({
  providedIn: 'root'
})
export class StorageService {

  constructor(private preferencesService: PreferencesService,
              private localStorageService: LocalStorageService,
              private driveStorageService: DriveStorageService,
              private driveAccountService: DriveAccountService,
              private messageReceiverService: MessageReceiverService) { }

  getSavedWindowsState(): Promise<SessionListState> {
    const savedWindowsStateSync$ = this.driveStorageService.getSavedWindowsState();
    const savedWindowsStateLocal$ = this.localStorageService.getSavedWindowsState();
    return this.preferencesService.getPreferences().then(preferences =>
      preferences.syncSavedWindows ? savedWindowsStateSync$ : savedWindowsStateLocal$
    );
  }

  setSavedWindowsState(sessionListState: SessionListState): Promise<void> {
    return this.preferencesService.getPreferences().then(preferences =>
      preferences.syncSavedWindows
        ? this.driveStorageService.setSavedWindowsState(sessionListState)
        : this.localStorageService.setSavedWindowsState(sessionListState)
    );
  }

  savedSessionStateUpdated$(): Observable<SessionListState> {
    return this.preferencesService.preferences$.pipe(
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
