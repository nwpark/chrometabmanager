import {ChromeAPIWindowState} from '../app/types/chrome-api-types';
import {InsertWindowMessageData, MessagePassingService} from '../app/services/message-passing.service';
import Mutex from 'async-mutex/lib/Mutex';
import {SessionListState} from '../app/types/session-list-state';
import {SessionListUtils} from '../app/classes/session-list-utils';
import {SessionUtils} from '../app/classes/session-utils';
import {LocalStorageService} from '../app/services/local-storage.service';
import {StorageKeys} from '../app/types/storage-keys';

export class ActiveWindowStateManager {

  private localStorageService: LocalStorageService;

  private sessionListState: SessionListState;
  private mutex: Mutex;

  constructor() {
    this.localStorageService = new LocalStorageService();
    this.sessionListState = SessionListState.empty();
    this.mutex = new Mutex();
    MessagePassingService.onInsertChromeWindowRequest((request: InsertWindowMessageData) => {
      this.insertWindow(request.chromeWindow, request.index);
    });
    this.updateActiveWindowState();
  }

  updateActiveWindowState() {
    this.mutex.acquire().then(releaseLock => {
      Promise.all([
        this.getChromeWindowsFromAPI(),
        this.localStorageService.getActiveWindowsLayoutState()
      ]).then(res => {
        const chromeWindows: ChromeAPIWindowState[] = res[0];
        const layoutState = SessionListUtils.cleanupLayoutState(res[1], chromeWindows);
        const sessionMap = SessionListUtils.createSessionMapFromWindowList(chromeWindows);
        this.sessionListState = new SessionListState(sessionMap, layoutState);
        this.localStorageService.setActiveWindowsState(this.sessionListState, releaseLock);
      });
    });
  }

  private insertWindow(chromeWindow: ChromeAPIWindowState, index) {
    this.mutex.acquire().then(releaseLock => {
      const tabsUrls = chromeWindow.tabs.map(tab => tab.url);
      chrome.windows.create({url: tabsUrls, focused: false}, window => {
        const session = SessionUtils.createSessionFromWindow(window as ChromeAPIWindowState);
        const layoutState = SessionListUtils.createBasicWindowLayoutState(window.id);
        this.sessionListState.insertSession(session, layoutState, index);
        this.localStorageService.setActiveWindowsState(this.sessionListState, releaseLock);
      });
    });
  }

  getChromeWindowsFromAPI(): Promise<ChromeAPIWindowState[]> {
    return new Promise<ChromeAPIWindowState[]>(resolve => {
      chrome.windows.getAll({populate: true}, chromeWindows => {
        resolve(chromeWindows as ChromeAPIWindowState[]);
      });
    });
  }

  getWindow(windowId: any) {
    return this.sessionListState.getWindow(windowId);
  }

  getTab(windowId: any, tabId: any) {
    return this.sessionListState.getTabFromWindow(windowId, tabId);
  }
}
