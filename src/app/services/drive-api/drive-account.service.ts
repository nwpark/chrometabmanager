import {Injectable} from '@angular/core';
import {createDefaultDriveLoginStatus, DriveLoginStatus} from '../../types/drive-login-status';
import {combineLatest, Observable, ReplaySubject} from 'rxjs';
import {MessageReceiverService} from '../messaging/message-receiver.service';
import {GoogleApiService} from './google-api.service';
import {DriveStorageService} from './drive-storage.service';
import {distinctUntilChanged, map, take} from 'rxjs/operators';
import {getCurrentTimeStringWithMillis} from '../../utils/date-utils';
import {PreferencesService} from '../preferences.service';
import {getSyncStatus, SyncStatus} from '../../types/sync-status';
import {OAuth2Service} from '../oauth2/o-auth-2.service';
import {Mutator} from '../../types/mutator';

@Injectable({
  providedIn: 'root'
})
export class DriveAccountService {

  private loginStatus = new ReplaySubject<DriveLoginStatus>(1);
  loginStatus$ = this.loginStatus.asObservable();

  constructor(private driveStorageService: DriveStorageService,
              private oAuth2Service: OAuth2Service,
              private googleApiService: GoogleApiService,
              private messageReceiverService: MessageReceiverService,
              private preferencesService: PreferencesService) {
    this.driveStorageService.getLoginStatus().then(loginStatus => {
      this.hydrateLoginStatus(loginStatus);
    });
    this.messageReceiverService.driveLoginStatusUpdated$.subscribe(loginStatus => {
      this.hydrateLoginStatus(loginStatus);
    });
  }

  private hydrateLoginStatus(loginStatus: DriveLoginStatus) {
    console.log(getCurrentTimeStringWithMillis(), '- refreshing drive login status');
    this.loginStatus.next(loginStatus);
  }

  getLoginStatus(): Promise<DriveLoginStatus> {
    return this.loginStatus$.pipe(take(1)).toPromise();
  }

  getSyncStatus$(): Observable<SyncStatus> {
    return combineLatest(
      this.loginStatus$,
      this.preferencesService.preferences$,
      this.oAuth2Service.getAuthStatus$(),
    ).pipe(
      map(([loginStatus, preferences, authStatus]) => {
        return getSyncStatus(loginStatus, preferences, authStatus);
      }),
      distinctUntilChanged()
    );
  }

  enableSync(): Promise<void> {
    return this.googleApiService.requestUserAccountInformation().then(accountInfo => {
      return this.updateLoginStatus({
        syncInProgress: false,
        userAccountInfo: accountInfo.user
      });
    }).then(() => {
      return this.preferencesService.setSyncSavedWindows(true);
    });
  }

  setSyncInProgress(syncInProgress: boolean): Promise<void> {
    return this.modifyLoginStatus(loginStatus => {
      loginStatus.syncInProgress = syncInProgress;
    });
  }

  performSyncUpdate<T>(syncUpdate: () => Promise<T>) {
    return this.setSyncInProgress(true).then(() => {
      return syncUpdate();
    }).finally(() => {
      return this.setSyncInProgress(false);
    });
  }

  getSavedSessionsFileId(): Promise<string> {
    return this.getLoginStatus().then(loginStatus => {
      return loginStatus.savedSessionsFileId;
    });
  }

  setSavedSessionsFileId(fileId: string): Promise<void> {
    return this.modifyLoginStatus(loginStatus => {
      loginStatus.savedSessionsFileId = fileId;
    });
  }

  clearLoginStatus(): Promise<void> {
    return this.updateLoginStatus(createDefaultDriveLoginStatus());
  }

  private modifyLoginStatus(mutate: Mutator<DriveLoginStatus>): Promise<void> {
    return this.getLoginStatus().then(loginStatus => {
      mutate(loginStatus);
      return this.updateLoginStatus(loginStatus);
    });
  }

  private updateLoginStatus(loginStatus: DriveLoginStatus): Promise<void> {
    console.log(getCurrentTimeStringWithMillis(), '- updating drive login status');
    this.loginStatus.next(loginStatus);
    return this.driveStorageService.setLoginStatus(loginStatus);
  }
}
