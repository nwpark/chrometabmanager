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
import {getSyncStatusMetaInfo} from '../../types/sync-status';

@Injectable({
  providedIn: 'root'
})
export class StorageService {

  private storageSubjectsInitialized = false;
  private savedSessionStateSync = new ReplaySubject<SessionListState>(1);
  private savedSessionStateLocal = new ReplaySubject<SessionListState>(1);

  constructor(private preferencesService: PreferencesService,
              private localStorageService: LocalStorageService,
              private driveStorageService: DriveStorageService,
              private driveAccountService: DriveAccountService,
              private messageReceiverService: MessageReceiverService) { }

  setSavedWindowsState(sessionListState: SessionListState): Promise<void> {
    return this.shouldUseSyncStorage().then(shouldUseSyncStorage => {
      return shouldUseSyncStorage
        ? this.driveStorageService.setSavedWindowsState(sessionListState)
        : this.localStorageService.setSavedWindowsState(sessionListState);
    });
  }

  @requiresSubjectInitialization()
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
        return getSyncStatusMetaInfo(syncStatus).shouldUseSyncStorage;
      }),
      distinctUntilChanged()
    );
  }

  @requiresSubjectInitialization()
  reloadSavedSessionState() {
    this.driveStorageService.getSavedWindowsState().subscribe(sessionListState => {
      this.savedSessionStateSync.next(sessionListState);
    });
    this.localStorageService.getSavedWindowsState().then(sessionListState => {
      this.savedSessionStateLocal.next(sessionListState);
    });
  }

  copySavedSessions(storageCopyDirection: StorageCopyDirection): Promise<void> {
    return Promise.all([
      this.driveStorageService.getSavedWindowsStateSkipCache(),
      this.localStorageService.getSavedWindowsState()
    ]).then(res => {
      const [savedSessionStateSync, savedSessionStateLocal] = res;
      if (storageCopyDirection === StorageCopyDirection.FromLocalToSync) {
        savedSessionStateSync.addAll(savedSessionStateLocal);
        return this.driveStorageService.setSavedWindowsState(savedSessionStateSync);
      } else {
        savedSessionStateLocal.addAll(savedSessionStateSync);
        return this.localStorageService.setSavedWindowsState(savedSessionStateLocal);
      }
    });
  }

  private initStorageSubjects() {
    merge(
      this.driveStorageService.getSavedWindowsState(),
      this.messageReceiverService.savedSessionStateSyncUpdated$
    ).subscribe(sessionListState => {
      this.savedSessionStateSync.next(sessionListState);
    });
    merge(
      this.localStorageService.getSavedWindowsState(),
      this.messageReceiverService.savedSessionStateUpdated$
    ).subscribe(sessionListState => {
      this.savedSessionStateLocal.next(sessionListState);
    });
    this.storageSubjectsInitialized = true;
  }

  clearStorage() {
    chrome.storage.local.clear();
    chrome.storage.sync.clear();
    chrome.runtime.reload();
  }
}

function requiresSubjectInitialization(): MethodDecorator {
  return (target: () => void, key: string, descriptor: any) => {
    const originalMethod = descriptor.value;

    descriptor.value =  function(...args: any[]) {
      if (!this.storageSubjectsInitialized) {
        this.initStorageSubjects();
      }
      return originalMethod.apply(this, args);
    };

    return descriptor;
  };
}

export enum StorageCopyDirection {
  FromLocalToSync,
  FromSyncToLocal
}
