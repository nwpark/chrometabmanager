import {Injectable} from '@angular/core';
import {createDefaultDriveLoginStatus, DriveLoginStatus} from '../../types/drive-login-status';
import {ReplaySubject} from 'rxjs';
import {MessageReceiverService} from '../messaging/message-receiver.service';
import {OAuth2Service} from './o-auth-2.service';
import {GoogleApiService} from './google-api.service';
import {DriveStorageService} from './drive-storage.service';
import {ChromePermissionsService} from '../chrome-permissions.service';
import {take} from 'rxjs/operators';
import {getCurrentTimeStringWithMillis} from '../../utils/date-utils';
import {PreferencesService} from '../preferences.service';

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
    return this.loginStatus$.pipe(take(1)).toPromise();
  }

  performInteractiveLogin(): Promise<string> {
    return this.oAuth2Service.getAuthToken({interactive: true});
  }

  enableSync(): Promise<any> {
    return this.googleApiService.requestUserAccountInformation().then(accountInfo => {
      return Promise.all([
        this.updateLoginStatus({
          isLoggedIn: true,
          syncInProgress: false,
          userAccountInfo: accountInfo.user
        }),
        this.preferencesService.setSyncSavedWindows(true)
      ]);
    });
  }

  logout(): Promise<any> {
    return this.oAuth2Service.revokeAuthToken().then(() => {
      const updateLoginStatusPromise = this.updateLoginStatus(createDefaultDriveLoginStatus());
      const clearCacheDataPromise = this.driveStorageService.clearCacheData();
      return Promise.all([updateLoginStatusPromise, clearCacheDataPromise]);
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
