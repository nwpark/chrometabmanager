import {Injectable} from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class MessagePassingService {

  static readonly ACTIVE_WINDOWS_UPDATED = 'activeWindowsUpdated_71f38bbe';
  static readonly SAVED_WINDOWS_UPDATED = 'savedWindowsUpdated_0656e252';
  static readonly CLOSED_SESSIONS_UPDATED = 'closedSessionsUpdated_7d763bba';

  constructor() {}

  static addActiveWindowStateListener(callback: () => void) {
    MessagePassingService.addEventListener(MessagePassingService.ACTIVE_WINDOWS_UPDATED, callback);
  }

  static addSavedWindowStateListener(callback: () => void) {
    MessagePassingService.addEventListener(MessagePassingService.SAVED_WINDOWS_UPDATED, callback);
  }

  static addClosedSessionStateListener(callback: () => void) {
    MessagePassingService.addEventListener(MessagePassingService.CLOSED_SESSIONS_UPDATED, callback);
  }

  private static addEventListener(eventId: string, callback: () => void) {
    chrome.runtime.onMessage.addListener(message => {
      if (message === eventId) {
        callback();
      }
    });
  }

  static notifyActiveWindowStateListeners() {
    chrome.runtime.sendMessage(MessagePassingService.ACTIVE_WINDOWS_UPDATED);
  }

  static notifySavedWindowStateListeners() {
    chrome.runtime.sendMessage(MessagePassingService.SAVED_WINDOWS_UPDATED);
  }

  static notifyClosedSessionStateListeners() {
    chrome.runtime.sendMessage(MessagePassingService.CLOSED_SESSIONS_UPDATED);
  }
}
