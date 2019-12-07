import {ChromeAPIWindowState, SessionUtils} from '../app/types/chrome-api-types';
import {StorageService} from '../app/services/storage.service';
import {InsertWindowMessageData, MessagePassingService} from '../app/services/message-passing.service';
import Mutex from 'async-mutex/lib/Mutex';
import {SessionListLayoutState, SessionListState, SessionListUtils} from '../app/types/session-list-state';

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
        StorageService.getActiveWindowsLayoutState()
      ]).then(res => {
        const activeWindows: ChromeAPIWindowState[] = res[0];
        const layoutState: SessionListLayoutState = res[1];
        const activeSessions = activeWindows.map((chromeWindow: ChromeAPIWindowState) =>
          SessionUtils.createSessionFromWindow(chromeWindow)
        );
        SessionListUtils.cleanupLayoutState(layoutState, activeSessions);
        // todo: cleanup
        const activeSessionMap = {};
        activeSessions.forEach(session => activeSessionMap[SessionUtils.getSessionId(session)] = session);
        this.sessionListState = new SessionListState(activeSessionMap, layoutState);
        StorageService.setActiveWindowsState(this.sessionListState, releaseLock);
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
        StorageService.setActiveWindowsState(this.sessionListState, releaseLock);
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
