import {Injectable} from '@angular/core';
import {merge, Observable, Subject} from 'rxjs';
import {buffer, filter, map} from 'rxjs/operators';
import {SessionListState} from '../types/closed-session-list-state';
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
  }

  // todo: copy this method for saved tabs in case there are multiple new tab windows
  addClosedSessionStateListener(callback: () => void) {
    chrome.storage.onChanged.addListener((changes, areaName) => {
      if (changes[StorageService.RECENTLY_CLOSED_SESSIONS]) {
        callback();
      }
    });
  }

  addSavedWindowsUpdatedListener(callback: () => void) {
    chrome.storage.onChanged.addListener((changes, areaName) => {
      if (changes[StorageService.SAVED_WINDOWS]) {
        callback();
      }
    });
  }
}
