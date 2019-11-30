import {Injectable} from '@angular/core';
import {StorageService} from './storage.service';

@Injectable({
  providedIn: 'root'
})
export class ChromeEventHandlerService {

  static readonly ACTIVE_WINDOWS_UPDATED = 'activeWindowsUpdated';

  constructor() {}

  addActiveWindowsUpdatedListener(callback: () => void) {
    chrome.runtime.onMessage.addListener(message => {
      if (message[ChromeEventHandlerService.ACTIVE_WINDOWS_UPDATED]) {
        callback();
      }
    });
    chrome.storage.onChanged.addListener(changes => {
      if (changes[StorageService.ACTIVE_WINDOWS_LAYOUT_STATE]) {
        callback();
      }
    });
  }

  static addClosedSessionStateListener(callback: () => void) {
    chrome.storage.onChanged.addListener((changes, areaName) => {
      if (changes[StorageService.RECENTLY_CLOSED_SESSIONS]
        || changes[StorageService.RECENTLY_CLOSED_SESSIONS_LAYOUT_STATE]) {
        callback();
      }
    });
  }

  addSavedWindowsUpdatedListener(callback: () => void) {
    chrome.storage.onChanged.addListener((changes, areaName) => {
      if (changes[StorageService.SAVED_WINDOWS]
        || changes[StorageService.SAVED_WINDOWS_LAYOUT_STATE]) {
        callback();
      }
    });
  }
}
