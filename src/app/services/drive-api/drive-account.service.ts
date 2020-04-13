import {Injectable} from '@angular/core';
import {createDefaultDriveLoginStatus, DriveLoginStatus} from '../../types/drive-login-status';
import {Subject} from 'rxjs';
import {MessageReceiverService} from '../messaging/message-receiver.service';
import {MessagePassingService} from '../messaging/message-passing.service';
import {OAuth2Service} from './o-auth-2.service';
import {GoogleApiService} from './google-api.service';
import {DriveStorageService} from './drive-storage.service';

@Injectable({
  providedIn: 'root'
})
export class DriveAccountService {

  private loginStatus = new Subject<DriveLoginStatus>();
  loginStatus$ = this.loginStatus.asObservable();

  constructor(private driveStorageService: DriveStorageService,
              private oAuth2Service: OAuth2Service,
              private googleApiService: GoogleApiService,
              private messageReceiverService: MessageReceiverService,
              private messagePassingService: MessagePassingService) {
    this.driveStorageService.getLoginStatus().then(loginStatus => {
      this.setLoginStatus(loginStatus);
    });
    this.messageReceiverService.driveLoginStatusUpdated$.subscribe(loginStatus => {
      this.setLoginStatus(loginStatus);
    });
  }

  private setLoginStatus(loginStatus: DriveLoginStatus) {
    console.log(new Date().toTimeString().substring(0, 8), '- refreshing drive login status');
    this.loginStatus.next(loginStatus);
  }

  performInteractiveLogin(): Promise<string> {
    return this.oAuth2Service.getAuthToken({interactive: true});
  }

  loadDataFromDrive(): Promise<any> {
    return this.requestLoginStatus().then(loginStatus => {
      return this.updateLoginStatus(loginStatus);
    }).then(() => {
      return this.messagePassingService.requestLoadDriveFileData();
    });
  }

  logout(): Promise<any> {
    return this.oAuth2Service.revokeAuthToken().then(() => {
      const updateLoginStatusPromise = this.updateLoginStatus(createDefaultDriveLoginStatus());
      const clearCacheDataPromise = this.driveStorageService.clearCacheData();
      return Promise.all([updateLoginStatusPromise, clearCacheDataPromise]);
    });
  }

  private updateLoginStatus(loginStatus: DriveLoginStatus): Promise<void> {
    this.setLoginStatus(loginStatus);
    return this.driveStorageService.setLoginStatus(loginStatus);
  }

  private requestLoginStatus(): Promise<DriveLoginStatus> {
    return this.googleApiService.requestUserAccountInformation().then(accountInfo => {
      return {
        isLoggedIn: true,
        userAccountInfo: {
          displayName: accountInfo.user.displayName,
          photoLink: accountInfo.user.photoLink,
          emailAddress: accountInfo.user.emailAddress
        }
      };
    });
  }
}
