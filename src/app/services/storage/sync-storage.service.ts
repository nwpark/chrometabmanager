import {Injectable} from '@angular/core';
import {MessagePassingService} from '../messaging/message-passing.service';
import {Subject} from 'rxjs';
import {StorageKeys} from './storage-keys';
import {Preferences, PreferenceUtils} from '../../types/preferences';

@Injectable({
  providedIn: 'root'
})
export class SyncStorageService {

  private instanceId: string;
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

  setPreferences(preferences: Preferences) {
    chrome.storage.sync.set({
      [StorageKeys.LastModifiedBy]: this.instanceId,
      [StorageKeys.Preferences]: preferences
    }, () => {
      this.messagePassingService.broadcastPreferencesUpdated();
    });
  }
}
