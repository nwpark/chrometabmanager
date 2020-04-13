import {Injectable} from '@angular/core';
import {createDefaultDriveLoginStatus, DriveLoginStatus} from '../../types/drive-login-status';
import {SessionListState} from '../../types/session/session-list-state';
import {OAuth2Service} from './o-auth-2.service';
import {MessagePassingService} from '../messaging/message-passing.service';
import {StorageKeys} from '../storage/storage-keys';
import {validateSessionMap} from '../../types/session/session-map';
import {validateSessionListLayoutState} from '../../types/session/session-list-layout-state';
import {UndefinedObjectError} from '../../types/errors/UndefinedObjectError';

@Injectable({
  providedIn: 'root'
})
export class DriveStorageService {

  constructor(private oAuth2Service: OAuth2Service,
              private messagePassingService: MessagePassingService) { }

  getLoginStatus(): Promise<DriveLoginStatus> {
    const cachedLoginStatusPromise = this.readLoginStatusFromCache();
    const hasValidAuthTokenPromise = this.oAuth2Service.hasValidAuthToken();

    return Promise.all([cachedLoginStatusPromise, hasValidAuthTokenPromise]).then(res => {
      const [cachedLoginStatus, hasValidAuthToken] = res;
      const cacheEntryIsValid = hasValidAuthToken || !cachedLoginStatus.isLoggedIn;
      if (cacheEntryIsValid) {
        return cachedLoginStatus;
      } else {
        const defaultLoginStatus = createDefaultDriveLoginStatus();
        return this.setLoginStatus(defaultLoginStatus).then(() => {
          return defaultLoginStatus;
        });
      }
    });
  }

  setLoginStatus(loginStatus: DriveLoginStatus): Promise<void> {
    return this.writeLoginStatusToCache(loginStatus).then(() => {
      this.messagePassingService.broadcastDriveLoginStatus(loginStatus);
    });
  }

  getSavedWindowsState(): Promise<SessionListState> {
    // todo: asynchronously check for cache miss + prevent further writes until complete
    return this.readSavedWindowsStateFromCache();
  }

  setSavedWindowsState(sessionListState: SessionListState, options: CacheAccessOptions = {writeThrough: true}): Promise<void> {
    return this.writeSavedWindowsStateToCache(sessionListState).then(() => {
      this.messagePassingService.broadcastSavedSessionsSync(sessionListState);
      if (options.writeThrough) {
        return this.messagePassingService.requestUpdateDriveSavedSessions(sessionListState).then(res => {
          // todo: remove
          console.log(res);
        });
      }
    });
  }

  clearCacheData(): Promise<void> {
    return this.writeSavedWindowsStateToCache(SessionListState.empty());
  }

  private readLoginStatusFromCache(): Promise<DriveLoginStatus> {
    return new Promise<DriveLoginStatus>(resolve => {
      chrome.storage.local.get({
        [StorageKeys.DriveLoginStatus]: createDefaultDriveLoginStatus()
      }, data => {
        resolve(data[StorageKeys.DriveLoginStatus]);
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

  private readSavedWindowsStateFromCache(): Promise<SessionListState> {
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

  private writeSavedWindowsStateToCache(sessionListState: SessionListState): Promise<void> {
    return new Promise<void>(resolve => {
      chrome.storage.local.set({
        [StorageKeys.DriveCacheSavedWindows]: sessionListState.getSessionMap(),
        [StorageKeys.DriveCacheSavedWindowsLayoutState]: sessionListState.getLayoutState()
      }, () => {
        resolve();
      });
    });
  }
}

interface CacheAccessOptions {
  writeThrough?: boolean;
}
