import {Injectable} from '@angular/core';
import {ChromeAPIWindowState} from '../types/chrome-api-types';

@Injectable({
  providedIn: 'root'
})
export class MessagePassingService {

  static readonly ACTIVE_WINDOWS_UPDATED = 'activeWindowsUpdated_71f38bbe';
  static readonly SAVED_WINDOWS_UPDATED = 'savedWindowsUpdated_0656e252';
  static readonly CLOSED_SESSIONS_UPDATED = 'closedSessionsUpdated_7d763bba';
  static readonly PREFERENCES_UPDATED = 'preferencesUpdated_a25466c6';
  static readonly INSERT_WINDOW_REQUEST = 'insertWindowRequest_de10f744';

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

  static addPreferencesListener(callback: () => void) {
    MessagePassingService.addEventListener(MessagePassingService.PREFERENCES_UPDATED, callback);
  }

  private static addEventListener(eventId: string, callback: () => void) {
    chrome.runtime.onMessage.addListener(message => {
      if (message === eventId) {
        callback();
      }
    });
  }

  static onInsertChromeWindowRequest(callback: (request: InsertWindowMessageData) => void) {
    chrome.runtime.onMessage.addListener(message => {
      if (message[MessagePassingService.INSERT_WINDOW_REQUEST]) {
        callback(message[MessagePassingService.INSERT_WINDOW_REQUEST]);
      }
    });
  }

  static requestInsertChromeWindow(chromeWindow: ChromeAPIWindowState, index: number) {
    const message: InsertWindowMessageData = { chromeWindow, index };
    chrome.runtime.sendMessage({
      [MessagePassingService.INSERT_WINDOW_REQUEST]: message
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

  static notifyPreferenceListeners() {
    chrome.runtime.sendMessage(MessagePassingService.PREFERENCES_UPDATED);
  }
}

export interface InsertWindowMessageData {
  chromeWindow: ChromeAPIWindowState;
  index: number;
}
