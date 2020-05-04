import {Injectable} from '@angular/core';
import {createDefaultDriveLoginStatus, DriveLoginStatus} from '../../types/drive-login-status';
import {SessionListState} from '../../types/session/session-list-state';
import {MessagePassingService} from '../messaging/message-passing.service';
import {StorageKeys} from '../storage/storage-keys';
import {validateSessionMap} from '../../types/session/session-map';
import {validateSessionListLayoutState} from '../../types/session/session-list-layout-state';
import {UndefinedObjectError} from '../../types/errors/UndefinedObjectError';
import {Observable} from 'rxjs';
import {last} from 'rxjs/operators';
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

  getSavedWindowsStateSkipCache(): Promise<SessionListState> {
    return this.getSavedWindowsState()
      .pipe(last<SessionListState>())
      .toPromise();
  }

  getSavedWindowsState(): Observable<SessionListState> {
    return new Observable<SessionListState>(observer => {
      this.readSavedWindowsStateFromCache().then(cachedSessionListState => {
        observer.next(cachedSessionListState);
        // Writes will be blocked until this resolves
        return this.checkForSessionListStateCacheMiss(cachedSessionListState).then(cacheAccessStatus => {
          if (cacheAccessStatus.cacheMissOccurred) {
            observer.next(cacheAccessStatus.data);
          }
        });
      }).catch(error => {
        observer.error(error);
      }).finally(() => {
        observer.complete();
      });
    });
  }

  private checkForSessionListStateCacheMiss(cachedSessionListState: SessionListState): Promise<CacheAccessStatus<SessionListState>> {
    return this.messagePassingService.requestLoadDriveFileData().then(sessionListState => {
      if (cachedSessionListState.equals(sessionListState)) {
        return {cacheMissOccurred: false, data: cachedSessionListState};
      } else {
        return this.writeSavedWindowsStateToCache(sessionListState).then(() => {
          return {cacheMissOccurred: true, data: sessionListState};
        });
      }
    });
  }

  setSavedWindowsState(sessionListState: SessionListState): Promise<void> {
    return this.writeSavedWindowsStateToCache(sessionListState).then(() => {
      return this.messagePassingService.requestUpdateDriveSavedSessions(sessionListState).then(res => {
        console.log(getCurrentTimeStringWithMillis(), '- received response from patch request:', res);
      });
    });
  }

  clearCacheData(): Promise<void> {
    return this.writeSavedWindowsStateToCache(SessionListState.empty());
  }

  private writeSavedWindowsStateToCache(sessionListState: SessionListState): Promise<void> {
    return new Promise<void>(resolve => {
      chrome.storage.local.set({
        [StorageKeys.DriveCacheSavedWindows]: sessionListState.getSessionMap(),
        [StorageKeys.DriveCacheSavedWindowsLayoutState]: sessionListState.getLayoutState()
      }, () => {
        this.messagePassingService.broadcastSavedSessionsSync(sessionListState);
        resolve();
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
}

interface CacheAccessStatus<T> {
  cacheMissOccurred: boolean;
  data: T;
}
