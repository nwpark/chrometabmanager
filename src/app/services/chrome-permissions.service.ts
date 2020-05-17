import {Injectable} from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ChromePermissionsService {

  private readonly DRIVE_API_PERMISSIONS = {
    permissions: ['identity', 'identity.email'],
    origins: ['https://www.googleapis.com/*']
  };

  constructor() { }

  hasDriveAPIPermissions(): Promise<boolean> {
    return new Promise<boolean>(resolve => {
      chrome.permissions.contains(this.DRIVE_API_PERMISSIONS, resolve);
    });
  }

  requestDriveAPIPermissions(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      chrome.permissions.request(this.DRIVE_API_PERMISSIONS, granted => {
        if (granted) {
          resolve();
        } else {
          reject();
        }
      });
    });
  }
}
