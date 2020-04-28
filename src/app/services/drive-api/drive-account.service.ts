import {Injectable} from '@angular/core';
import {createDefaultDriveLoginStatus, DriveLoginStatus} from '../../types/drive-login-status';
import {combineLatest, Observable, ReplaySubject} from 'rxjs';
import {MessageReceiverService} from '../messaging/message-receiver.service';
import {OAuth2Service} from './o-auth-2.service';
import {GoogleApiService} from './google-api.service';
import {DriveStorageService} from './drive-storage.service';
import {ChromePermissionsService} from '../chrome-permissions.service';
import {distinctUntilChanged, map, take} from 'rxjs/operators';
import {getCurrentTimeStringWithMillis} from '../../utils/date-utils';
import {PreferencesService} from '../preferences.service';
import {getSyncStatus, SyncStatus} from '../../types/sync-status';

@Injectable({
  providedIn: 'root'
})
export class DriveAccountService {

  private loginStatus = new ReplaySubject<DriveLoginStatus>(1);
  loginStatus$ = this.loginStatus.asObservable();

  constructor(private driveStorageService: DriveStorageService,
              private oAuth2Service: OAuth2Service,
              private googleApiService: GoogleApiService,
              private chromePermissionsService: ChromePermissionsService,
              private messageReceiverService: MessageReceiverService,
              private preferencesService: PreferencesService) {
    this.driveStorageService.getLoginStatus().then(loginStatus => {
      this.setLoginStatus(loginStatus);
    });
    this.messageReceiverService.driveLoginStatusUpdated$.subscribe(loginStatus => {
      this.setLoginStatus(loginStatus);
    });
  }

  private setLoginStatus(loginStatus: DriveLoginStatus) {
    console.log(getCurrentTimeStringWithMillis(), '- refreshing drive login status');
    this.loginStatus.next(loginStatus);
  }

  getLoginStatus(): Promise<DriveLoginStatus> {
    return Promise.all([
      this.loginStatus$.pipe(take(1)).toPromise(),
      this.oAuth2Service.hasValidAuthToken()
    ]).then(([loginStatus, hasValidAuthToken]) => {
      // todo: update loginStatus if it changed
      loginStatus.isLoggedIn = hasValidAuthToken;
      return loginStatus;
    });
  }

  performInteractiveLogin(): Promise<string> {
    return this.oAuth2Service.getAuthToken({interactive: true});
  }

  getSyncStatus$(): Observable<SyncStatus> {
    return combineLatest(
      this.loginStatus$,
      this.preferencesService.preferences$
    ).pipe(
      map(([loginStatus, preferences]) => {
        return getSyncStatus(loginStatus, preferences);
      }),
      distinctUntilChanged()
    );
  }

  enableSync(): Promise<void> {
    return this.googleApiService.requestUserAccountInformation().then(accountInfo => {
      return this.updateLoginStatus({
        isLoggedIn: true,
        syncInProgress: false,
        userAccountInfo: accountInfo.user
      });
    }).then(() => {
      return this.preferencesService.setSyncSavedWindows(true);
    });
  }

  setSyncInProgress(syncInProgress: boolean): Promise<void> {
    return this.getLoginStatus().then(loginStatus => {
      loginStatus.syncInProgress = syncInProgress;
      return this.updateLoginStatus(loginStatus);
    });
  }

  getSavedSessionsFileId(): Promise<string> {
    return this.getLoginStatus().then(loginStatus => {
      return loginStatus.savedSessionsFileId;
    });
  }

  setSavedSessionsFileId(fileId: string): Promise<void> {
    return this.getLoginStatus().then(loginStatus => {
      loginStatus.savedSessionsFileId = fileId;
      return this.updateLoginStatus(loginStatus);
    });
  }

  private updateLoginStatus(loginStatus: DriveLoginStatus): Promise<void> {
    console.log(getCurrentTimeStringWithMillis(), '- updating drive login status');
    this.loginStatus.next(loginStatus);
    return this.driveStorageService.setLoginStatus(loginStatus);
  }
}
