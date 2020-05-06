import {Injectable} from '@angular/core';
import {createDefaultDriveLoginStatus, DriveLoginStatus} from '../../types/drive-login-status';
import {SessionListState} from '../../types/session/session-list-state';
import {MessagePassingService} from '../messaging/message-passing.service';
import {StorageKeys} from '../storage/storage-keys';
import {validateSessionMap} from '../../types/session/session-map';
import {validateSessionListLayoutState} from '../../types/session/session-list-layout-state';
import {UndefinedObjectError} from '../../types/errors/UndefinedObjectError';
import {getCurrentTimeStringWithMillis} from '../../utils/date-utils';

@Injectable({
  providedIn: 'root'
})
export class DriveStorageService {

  constructor(private messagePassingService: MessagePassingService) { }

  getLoginStatus(): Promise<DriveLoginStatus> {
    return new Promise<DriveLoginStatus>(resolve => {
      chrome.storage.local.get({
        [StorageKeys.DriveLoginStatus]: createDefaultDriveLoginStatus()
      }, data => {
        resolve(data[StorageKeys.DriveLoginStatus]);
      });
    });
  }

  setLoginStatus(loginStatus: DriveLoginStatus): Promise<void> {
    return this.writeLoginStatusToCache(loginStatus).then(() => {
      this.messagePassingService.broadcastDriveLoginStatus(loginStatus);
    });
  }

  getSavedWindowsStateFromDrive(): Promise<SessionListState> {
    return this.messagePassingService.requestLoadDriveFileData().then(sessionListState => {
      return this.writeSavedWindowsStateToCache(sessionListState);
    });
  }

  setSavedWindowsState(sessionListState: SessionListState): Promise<void> {
    return this.writeSavedWindowsStateToCache(sessionListState).then(() => {
      return this.messagePassingService.requestUpdateDriveSavedSessions(sessionListState).then(res => {
        console.log(getCurrentTimeStringWithMillis(), '- received response from patch request:', res);
      });
    });
  }

  private writeSavedWindowsStateToCache(sessionListState: SessionListState): Promise<SessionListState> {
    return new Promise<SessionListState>(resolve => {
      chrome.storage.local.set({
        [StorageKeys.DriveCacheSavedWindows]: sessionListState.getSessionMap(),
        [StorageKeys.DriveCacheSavedWindowsLayoutState]: sessionListState.getLayoutState()
      }, () => {
        this.messagePassingService.broadcastSavedSessionsSync(sessionListState);
        resolve(sessionListState);
      });
    });
  }

  private writeLoginStatusToCache(driveLoginStatus: DriveLoginStatus): Promise<void> {
    return new Promise<void>(resolve => {
      chrome.storage.local.set({
        [StorageKeys.DriveLoginStatus]: driveLoginStatus
      }, () => {
        resolve();
      });
    });
  }

  readSavedWindowsStateFromCache(): Promise<SessionListState> {
    return new Promise<SessionListState>((resolve, reject) => {
      chrome.storage.local.get([
        StorageKeys.DriveCacheSavedWindows,
        StorageKeys.DriveCacheSavedWindowsLayoutState
      ], data => {
        try {
          const sessionMap = data[StorageKeys.DriveCacheSavedWindows];
          const layoutState = data[StorageKeys.DriveCacheSavedWindowsLayoutState];
          validateSessionMap(sessionMap);
          validateSessionListLayoutState(layoutState);
          resolve(SessionListState.fromSessionMap(sessionMap, layoutState));
        } catch (error) {
          if (error instanceof UndefinedObjectError) {
            resolve(SessionListState.empty());
          } else {
            reject(error);
          }
        }
      });
    });
  }
}
