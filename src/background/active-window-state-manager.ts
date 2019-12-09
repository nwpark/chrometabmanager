import {ChromeAPIWindowState} from '../app/types/chrome-api-types';
import {InsertWindowMessageData, MessagePassingService} from '../app/services/message-passing.service';
import Mutex from 'async-mutex/lib/Mutex';
import {SessionListState} from '../app/types/session-list-state';
import {ChromeStorageUtils} from '../app/classes/chrome-storage-utils';
import {SessionListUtils} from '../app/classes/session-list-utils';
import {SessionUtils} from '../app/classes/session-utils';

export class ActiveWindowStateManager {

  private sessionListState: SessionListState;
  private mutex: Mutex;

  static getChromeWindowsFromAPI(): Promise<ChromeAPIWindowState[]> {
    return new Promise<ChromeAPIWindowState[]>(resolve => {
      chrome.windows.getAll({populate: true}, chromeWindows => {
        resolve(chromeWindows as ChromeAPIWindowState[]);
      });
    });
  }

  constructor() {
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
        ActiveWindowStateManager.getChromeWindowsFromAPI(),
        ChromeStorageUtils.getActiveWindowsLayoutState()
      ]).then(res => {
        const chromeWindows: ChromeAPIWindowState[] = res[0];
        const layoutState = SessionListUtils.cleanupLayoutState(res[1], chromeWindows);
        const sessionMap = SessionListUtils.createSessionMapFromWindowList(chromeWindows);
        this.sessionListState = new SessionListState(sessionMap, layoutState);
        ChromeStorageUtils.setActiveWindowsState(this.sessionListState, releaseLock);
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
        ChromeStorageUtils.setActiveWindowsState(this.sessionListState, releaseLock);
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
