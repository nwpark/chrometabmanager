import {Injectable} from '@angular/core';
import {SessionListState} from '../../types/session/session-list-state';
import {PreferencesService} from '../preferences.service';
import {LocalStorageService} from './local-storage.service';
import {merge, Observable, ReplaySubject} from 'rxjs';
import {MessageReceiverService} from '../messaging/message-receiver.service';
import {distinctUntilChanged, map, switchMap} from 'rxjs/operators';
import {DriveStorageService} from '../drive-api/drive-storage.service';
import {DriveAccountService} from '../drive-api/drive-account.service';
import {DriveLoginStatus} from '../../types/drive-login-status';
import {getCurrentTimeStringWithMillis} from '../../utils/date-utils';

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
    return this.driveAccountService.getLoginStatus().then(loginStatus => {
      return this.shouldUseSyncStorage(loginStatus)
        ? this.driveStorageService.setSavedWindowsState(sessionListState)
        : this.localStorageService.setSavedWindowsState(sessionListState);
    });
  }

  @requiresSubjectInitialization()
  savedSessionState$(): Observable<SessionListState> {
    return this.driveAccountService.loginStatus$.pipe(
      map(loginStatus => this.shouldUseSyncStorage(loginStatus)),
      distinctUntilChanged(),
      switchMap(shouldUseSyncStorage => {
        console.log(`${getCurrentTimeStringWithMillis()} - switching saved sessions source (sync = ${shouldUseSyncStorage})`);
        return shouldUseSyncStorage
          ? this.savedSessionStateSync.asObservable()
          : this.savedSessionStateLocal.asObservable();
      })
    );
  }

  @requiresSubjectInitialization()
  reloadSavedSessionState() {
    this.driveStorageService.getSavedWindowsState().then(sessionListState => {
      this.savedSessionStateSync.next(sessionListState);
    });
    this.localStorageService.getSavedWindowsState().then(sessionListState => {
      this.savedSessionStateLocal.next(sessionListState);
    });
  }

  private shouldUseSyncStorage(loginStatus: DriveLoginStatus): boolean {
    return loginStatus.isLoggedIn && loginStatus.syncEnabled;
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
    // todo: split into clear for each section
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
