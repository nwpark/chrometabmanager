import {Injectable} from '@angular/core';
import {getCurrentTimeStringWithMillis} from '../utils/date-utils';
import {MessageReceiverService} from './messaging/message-receiver.service';
import {Observable} from 'rxjs';
import {tap} from 'rxjs/operators';
import {MessagePassingService} from './messaging/message-passing.service';

@Injectable({
  providedIn: 'root'
})
export class ChromePermissionsService {

  private readonly DRIVE_API_PERMISSIONS = {
    permissions: ['identity'],
    origins: ['https://www.googleapis.com/*']
  };

  private readonly IDENTITY_PERMISSIONS = {
    permissions: ['identity']
  };

  permissionsUpdated$: Observable<void>;

  constructor(private messageReceiverService: MessageReceiverService,
              private messagePassingService: MessagePassingService) {
    this.permissionsUpdated$ = this.messageReceiverService.chromePermissionsUpdated$.pipe(
      tap(() => console.log(getCurrentTimeStringWithMillis(), '- refreshing chrome permissions'))
    );
  }

  hasIdentityPermissions(): Promise<boolean> {
    return new Promise<boolean>(resolve => {
      chrome.permissions.contains(this.IDENTITY_PERMISSIONS, resolve);
    });
  }

  hasDriveAPIPermissions(): Promise<boolean> {
    return new Promise<boolean>(resolve => {
      chrome.permissions.contains(this.DRIVE_API_PERMISSIONS, resolve);
    });
  }

  requestDriveAPIPermissions(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      chrome.permissions.request(this.DRIVE_API_PERMISSIONS, granted => {
        if (granted) {
          this.notifyListeners();
          resolve();
        } else {
          reject();
        }
      });
    });
  }

  private notifyListeners() {
    console.log(getCurrentTimeStringWithMillis(), '- chrome permissions updated');
    this.messagePassingService.broadcastChromePermissionsUpdated();
  }
}
