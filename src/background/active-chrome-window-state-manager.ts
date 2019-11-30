import {ChromeAPIWindowState} from '../app/types/chrome-api-types';
import Mutex from 'async-mutex/lib/Mutex';
import {MessagePassingService} from '../app/services/message-passing.service';

export class ActiveChromeWindowStateManager {

  static readonly ACTIVE_CHROME_WINDOWS = 'activeChromeWindows_6aec4a56';

  activeWindowStorageMutex: Mutex;

  constructor() {
    this.activeWindowStorageMutex = new Mutex();
    this.updateActiveWindowState();
  }

  updateActiveWindowState() {
    MessagePassingService.notifyActiveWindowStateListeners();
    chrome.windows.getAll({populate: true}, chromeWindows => {
      this.storeActiveChromeWindows(chromeWindows as ChromeAPIWindowState[]);
    });
  }

  storeActiveChromeWindows(chromeWindows: ChromeAPIWindowState[]) {
    this.activeWindowStorageMutex.acquire().then(releaseLock => {
      const writeData = {[ActiveChromeWindowStateManager.ACTIVE_CHROME_WINDOWS]: chromeWindows};
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
