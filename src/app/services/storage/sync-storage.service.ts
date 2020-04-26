import {Injectable} from '@angular/core';
import {MessagePassingService} from '../messaging/message-passing.service';
import {StorageKeys} from './storage-keys';
import {Preferences, PreferenceUtils} from '../../types/preferences';
import {reloadWindow} from '../../utils/common';

@Injectable({
  providedIn: 'root'
})
export class SyncStorageConfig {
  deviceId: string;
}

@Injectable({
  providedIn: 'root'
})
export class SyncStorageService {

  private deviceId: string;

  constructor(private messagePassingService: MessagePassingService,
              config: SyncStorageConfig) {
    if (config.deviceId) {
      this.deviceId = config.deviceId;
    } else {
      this.messagePassingService.requestDeviceId().then(deviceId => {
        this.deviceId = deviceId;
      });
    }
    // @ts-ignore
    chrome.storage.sync.onChanged.addListener(() => {
      this.getLastModifierId().then(lastModifierId => {
        if (lastModifierId !== this.deviceId) {
          reloadWindow();
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

  getPreferences(): Promise<Preferences> {
    return new Promise<Preferences>(resolve => {
      chrome.storage.sync.get({
        [StorageKeys.Preferences]: PreferenceUtils.createDefaultPreferences()
      }, data => {
        resolve(data[StorageKeys.Preferences]);
      });
    });
  }

  setPreferences(preferences: Preferences): Promise<void> {
    return new Promise<void>(resolve => {
      chrome.storage.sync.set({
        [StorageKeys.LastModifiedBy]: this.deviceId,
        [StorageKeys.Preferences]: preferences
      }, () => {
        this.messagePassingService.broadcastPreferencesUpdated(preferences);
        resolve();
      });
    });
  }

  notifyOtherDevices() {
    chrome.storage.sync.set({
      [StorageKeys.LastModifiedBy]: this.deviceId,
      [StorageKeys.LastNotified]: Date.now()
    });
  }
}
