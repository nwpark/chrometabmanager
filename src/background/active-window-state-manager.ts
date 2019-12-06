import {ChromeAPIWindowState, SessionUtils} from '../app/types/chrome-api-types';
import {StorageService} from '../app/services/storage.service';
import {SessionListLayoutState, WindowListState, WindowListUtils} from '../app/types/window-list-state';
import {InsertWindowMessageData, MessagePassingService} from '../app/services/message-passing.service';
import Mutex from 'async-mutex/lib/Mutex';
import {SessionListState} from '../app/types/session-list-state';

export class ActiveWindowStateManager {

  private windowListState: WindowListState;
  private mutex: Mutex;

  static getChromeWindowsFromAPI(): Promise<ChromeAPIWindowState[]> {
    return new Promise<ChromeAPIWindowState[]>(resolve => {
      chrome.windows.getAll({populate: true}, chromeWindows => {
        resolve(chromeWindows as ChromeAPIWindowState[]);
      });
    });
  }

  constructor() {
    this.windowListState = WindowListState.empty();
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
        WindowListUtils.cleanupLayoutState(layoutState, activeWindows);
        this.windowListState = new WindowListState(activeWindows, layoutState);
        StorageService.setActiveWindowsState(this.convertToSessionListState(this.windowListState), releaseLock);
      });
    });
  }

  private insertWindow(chromeWindow: ChromeAPIWindowState, index) {
    this.mutex.acquire().then(releaseLock => {
      const tabsUrls = chromeWindow.tabs.map(tab => tab.url);
      chrome.windows.create({url: tabsUrls, focused: false}, window => {
        const newWindow = window as ChromeAPIWindowState;
        const layoutState = WindowListUtils.createBasicWindowLayoutState(newWindow.id);
        this.windowListState.insertSession(newWindow, layoutState, index);
        StorageService.setActiveWindowsState(this.convertToSessionListState(this.windowListState), releaseLock);
      });
    });
  }

  private convertToSessionListState(windowListState: WindowListState): SessionListState {
    const sessions = windowListState.chromeAPIWindows.map(window => SessionUtils.createSessionFromWindow(window));
    return new SessionListState(sessions, windowListState.layoutState);
  }

  getWindow(windowId: any) {
    return this.windowListState.getWindow(windowId);
  }

  getTab(windowId: any, tabId: any) {
    return this.windowListState.getTabFromWindow(windowId, tabId);
  }
}
