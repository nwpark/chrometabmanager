import { Injectable } from '@angular/core';
import {SessionListState} from '../../types/session/session-list-state';
import {StorageKeys} from './storage-keys';
import {validateSessionMap} from '../../types/session/session-map';
import {validateSessionListLayoutState} from '../../types/session/session-list-layout-state';
import {UndefinedObjectError} from '../../types/errors/UndefinedObjectError';
import {MessagePassingService} from '../messaging/message-passing.service';

@Injectable({
  providedIn: 'root'
})
export class DriveStorageCacheService {

  constructor(private messagePassingService: MessagePassingService) { }

  getSavedWindowsState(): Promise<SessionListState> {
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

  setSavedWindowsState(sessionListState: SessionListState): Promise<void> {
    return new Promise<void>(resolve => {
      chrome.storage.local.set({
        [StorageKeys.DriveCacheSavedWindows]: sessionListState.getSessionMap(),
        [StorageKeys.DriveCacheSavedWindowsLayoutState]: sessionListState.getLayoutState()
      }, () => {
        this.messagePassingService.broadcastSavedSessionsSync(sessionListState);
        resolve();
      });
      this.messagePassingService.requestUpdateDriveSavedSessions(sessionListState).then(res => {
        console.log(res);
      });
    });
  }
}
