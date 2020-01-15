import {Injectable} from '@angular/core';
import {SessionListState} from '../../types/session/session-list-state';
import {Subject} from 'rxjs';
import {Preferences, PreferenceUtils} from '../../types/preferences';
import {StorageKeys} from './storage-keys';
import {SyncStorageUtils} from '../../utils/sync-storage-utils';
import {SessionId} from '../../types/chrome-api/chrome-api-window-state';
import {MessagePassingService} from '../messaging/message-passing.service';
import {validateSessionListLayoutState} from '../../types/session/session-list-layout-state';
import {UndefinedObjectError} from '../../types/errors/UndefinedObjectError';
import {StorageWriteError} from '../../types/errors/storage-write-error';

@Injectable({
  providedIn: 'root'
})
export class SyncStorageService {

  instanceId: string;

  private onChanged = new Subject<void>();
  onChanged$ = this.onChanged.asObservable();

  constructor(private messagePassingService: MessagePassingService) {
    this.messagePassingService.requestInstanceId().then(instanceId => {
      this.instanceId = instanceId;
    });
    // @ts-ignore
    chrome.storage.sync.onChanged.addListener(() => {
      this.onChanged.next();
      this.getLastModifierId().then(lastModifierId => {
        if (lastModifierId !== this.instanceId) {
          // todo: if sync toggled then copy data
          window.location.reload();
        }
      });
    });
  }

  private getLastModifierId(): Promise<string> {
    return new Promise<string>(resolve => {
      chrome.storage.sync.get(StorageKeys.LastModifiedBy, data => {
        resolve(data[StorageKeys.LastModifiedBy]);
      });
    });
  }

  getBytesInUse(): Promise<number> {
    return new Promise<number>(resolve => {
      chrome.storage.sync.getBytesInUse(bytesInUse => {
        resolve(bytesInUse);
      });
    });
  }

  getPreferences(): Promise<Preferences> {
    return new Promise<Preferences>(resolve => {
      chrome.storage.sync.get({
        [StorageKeys.Preferences]: PreferenceUtils.createDefaultPreferences()
      }, data => {
        resolve(data[StorageKeys.Preferences]);
      });
    });
  }

  getSavedWindowsState(): Promise<SessionListState> {
    return new Promise<SessionListState>((resolve, reject) => {
      chrome.storage.sync.get(data => {
        try {
          const layoutState = data[StorageKeys.SavedWindowsLayoutState];
          validateSessionListLayoutState(layoutState);
          // todo: validate sessionStates
          const sessionStates = SyncStorageUtils.getSortedSessionStates(data, layoutState);
          resolve(SessionListState.fromSessionStates(sessionStates, layoutState.hidden));
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

  setPreferences(preferences: Preferences) {
    chrome.storage.sync.set({
      [StorageKeys.LastModifiedBy]: this.instanceId,
      [StorageKeys.Preferences]: preferences
    }, () => {
      this.messagePassingService.broadcastPreferencesUpdated();
    });
  }

  setSavedWindowsState(sessionListState: SessionListState, removedSessionIds?: SessionId[]): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      const sessionStateMap = sessionListState.getSessionStateMap();
      chrome.storage.sync.set({
        [StorageKeys.LastModifiedBy]: this.instanceId,
        ...sessionStateMap,
        [StorageKeys.SavedWindowsLayoutState]: sessionListState.getLayoutState()
      }, () => {
        if (chrome.runtime.lastError) {
          reject(new StorageWriteError(chrome.runtime.lastError.message));
        } else {
          if (removedSessionIds) {
            chrome.storage.sync.remove(removedSessionIds.map(sessionId => sessionId.toString()));
          }
          this.messagePassingService.broadcastSavedSessions(sessionListState);
          resolve();
        }
      });
    });
  }
}

