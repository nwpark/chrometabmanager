import {ChromeAPIWindowState} from '../app/types/chrome-api-types';
import Mutex from 'async-mutex/lib/Mutex';
import {ChromeEventHandlerService} from '../app/services/chrome-event-handler.service';

export class ActiveChromeWindowStateManager {

  static readonly ACTIVE_WINDOWS_UPDATED = ChromeEventHandlerService.ACTIVE_WINDOWS_UPDATED;
  static readonly ACTIVE_CHROME_WINDOWS = 'activeChromeWindows';

  activeWindowStorageMutex: Mutex;

  constructor() {
    this.activeWindowStorageMutex = new Mutex();
  }

  updateActiveWindowState() {
    chrome.runtime.sendMessage(keyWithValue(ActiveChromeWindowStateManager.ACTIVE_WINDOWS_UPDATED, true));
    chrome.windows.getAll({populate: true}, chromeWindows => {
      this.storeActiveChromeWindows(chromeWindows as ChromeAPIWindowState[]);
    });
  }

  storeActiveChromeWindows(chromeWindows: ChromeAPIWindowState[]) {
    this.activeWindowStorageMutex.acquire().then(releaseLock => {
      const writeData = keyWithValue(ActiveChromeWindowStateManager.ACTIVE_CHROME_WINDOWS, chromeWindows);
      chrome.storage.local.set(writeData, releaseLock);
    });
  }

  getActiveChromeWindowsFromStorage(): Promise<ChromeAPIWindowState[]> {
    return new Promise<ChromeAPIWindowState[]>(resolve => {
      this.activeWindowStorageMutex.acquire().then(releaseLock => {
        chrome.storage.local.get(ActiveChromeWindowStateManager.ACTIVE_CHROME_WINDOWS, data => {
          releaseLock();
          resolve(data[ActiveChromeWindowStateManager.ACTIVE_CHROME_WINDOWS] as ChromeAPIWindowState[]);
        });
      });
    });
  }
}

function keyWithValue(keyName: string, defaultValue: any) {
  const key = {};
  key[keyName] = defaultValue;
  return key;
}
