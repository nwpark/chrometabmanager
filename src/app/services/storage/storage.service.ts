import {Injectable} from '@angular/core';
import {SessionListState} from '../../types/session/session-list-state';
import {PreferencesService} from '../preferences.service';
import {LocalStorageService} from './local-storage.service';
import {merge, Observable, ReplaySubject} from 'rxjs';
import {MessageReceiverService} from '../messaging/message-receiver.service';
import {distinctUntilChanged, map, switchMap, take} from 'rxjs/operators';
import {DriveStorageService} from '../drive-api/drive-storage.service';
import {DriveAccountService} from '../drive-api/drive-account.service';
import {getCurrentTimeStringWithMillis} from '../../utils/date-utils';
import {getSyncStatusDetails} from '../../types/sync-status';

@Injectable({
  providedIn: 'root'
})
export class StorageService {

  private savedSessionStateSync = new ReplaySubject<SessionListState>(1);
  private savedSessionStateLocal = new ReplaySubject<SessionListState>(1);

  constructor(private preferencesService: PreferencesService,
              private localStorageService: LocalStorageService,
              private driveStorageService: DriveStorageService,
              private driveAccountService: DriveAccountService,
              private messageReceiverService: MessageReceiverService) {
    merge(this.driveStorageService.readSavedWindowsStateFromCache(),
        this.messageReceiverService.savedSessionStateSyncUpdated$).subscribe(sessionListState => {
      this.savedSessionStateSync.next(sessionListState);
    });
    merge(this.localStorageService.getSavedWindowsState(),
        this.messageReceiverService.savedSessionStateUpdated$).subscribe(sessionListState => {
      this.savedSessionStateLocal.next(sessionListState);
    });
    this.shouldUseSyncStorage().then(shouldUseSyncStorage => {
      if (shouldUseSyncStorage) {
        this.driveStorageService.getSavedWindowsStateFromDrive().then(sessionListState => {
          this.savedSessionStateSync.next(sessionListState);
        });
      }
    });
  }

  setSavedWindowsState(sessionListState: SessionListState): Promise<void> {
    return this.shouldUseSyncStorage().then(shouldUseSyncStorage => {
      return shouldUseSyncStorage
        ? this.driveStorageService.setSavedWindowsState(sessionListState)
        : this.localStorageService.setSavedWindowsState(sessionListState);
    });
  }

  savedSessionListState$(): Observable<SessionListState> {
    return this.shouldUseSyncStorage$().pipe(
      switchMap(shouldUseSyncStorage => {
        console.log(`${getCurrentTimeStringWithMillis()} - switching saved sessions source (sync = ${shouldUseSyncStorage})`);
        return shouldUseSyncStorage
          ? this.savedSessionStateSync.asObservable()
          : this.savedSessionStateLocal.asObservable();
      })
    );
  }

  private shouldUseSyncStorage(): Promise<boolean> {
    return this.shouldUseSyncStorage$().pipe(take(1)).toPromise();
  }

  private shouldUseSyncStorage$(): Observable<boolean> {
    return this.driveAccountService.getSyncStatus$().pipe(
      map(syncStatus => {
        return getSyncStatusDetails(syncStatus).shouldUseSyncStorage;
      }),
      distinctUntilChanged()
    );
  }

  reloadSavedSessionsSync(): Promise<void> {
    return this.driveStorageService.getSavedWindowsStateFromDrive().then(sessionListState => {
      this.savedSessionStateSync.next(sessionListState);
    });
  }

  copySavedSessions(storageCopyDirection: StorageCopyDirection): Promise<void> {
    return Promise.all([
      this.driveStorageService.getSavedWindowsStateFromDrive(),
      this.localStorageService.getSavedWindowsState()
    ]).then(res => {
      const [savedSessionStateSync, savedSessionStateLocal] = res;
      if (storageCopyDirection === StorageCopyDirection.FromLocalToSync) {
        savedSessionStateLocal.addAll(savedSessionStateSync);
        return this.driveStorageService.setSavedWindowsState(savedSessionStateLocal).then(() => {
          this.savedSessionStateSync.next(savedSessionStateLocal);
        });
      } else {
        savedSessionStateSync.addAll(savedSessionStateLocal);
        return this.localStorageService.setSavedWindowsState(savedSessionStateSync).then(() => {
          this.savedSessionStateLocal.next(savedSessionStateSync);
        });
      }
    });
  }

  clearStorage() {
    chrome.storage.local.clear();
    chrome.storage.sync.clear();
    chrome.runtime.reload();
  }
}

export enum StorageCopyDirection {
  FromLocalToSync,
  FromSyncToLocal
}
