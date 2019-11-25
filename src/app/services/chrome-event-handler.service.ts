import {Injectable} from '@angular/core';
import {merge, Observable, Subject} from 'rxjs';
import {buffer, filter, map} from 'rxjs/operators';

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
}
