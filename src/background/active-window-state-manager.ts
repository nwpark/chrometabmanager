import {InsertWindowMessageData, MessagePassingService} from '../app/services/messaging/message-passing.service';
import Mutex from 'async-mutex/lib/Mutex';
import {SessionListState} from '../app/types/session/session-list-state';
import {SessionListUtils} from '../app/utils/session-list-utils';
import {LayoutStateUtils, SessionUtils} from '../app/utils/session-utils';
import {LocalStorageService} from '../app/services/storage/local-storage.service';
import {ChromeAPISession} from '../app/types/chrome-api/chrome-api-session';
import {ChromeAPIWindowState, SessionId} from '../app/types/chrome-api/chrome-api-window-state';
import {SessionState} from '../app/types/session/session-state';
import {MessageReceiverService} from '../app/services/messaging/message-receiver.service';

export class ActiveWindowStateManager {

  private localStorageService: LocalStorageService;

  private sessionListState: SessionListState;
  private mutex: Mutex;

  constructor() {
    this.localStorageService = new LocalStorageService(new MessagePassingService());
    this.sessionListState = SessionListState.empty();
    this.mutex = new Mutex();
    MessageReceiverService.onInsertChromeWindowRequest((request: InsertWindowMessageData) => {
      this.insertWindow(request.sessionState, request.index);
    });
    this.updateActiveWindowState();
  }

  updateActiveWindowState() {
    this.mutex.acquire().then(releaseLock => {
      Promise.all([
        this.getChromeWindowsFromAPI(),
        this.localStorageService.getActiveWindowsLayoutState()
          // todo: uncomment
          // .catch(SessionListUtils.createEmptyListLayoutState)
      ]).then(res => {
        const chromeWindows: ChromeAPIWindowState[] = res[0];
        // todo: support different session types here
        const layoutState = SessionListUtils.cleanupLayoutState(res[1], chromeWindows);
        const sessionMap = SessionListUtils.createSessionMapFromWindowList(chromeWindows);
        this.sessionListState = SessionListState.fromSessionMap(sessionMap, layoutState);
        this.localStorageService.setActiveWindowsState(this.sessionListState)
          .then(releaseLock);
      }).catch(releaseLock);
    });
  }

  private insertWindow(sessionState: SessionState, index) {
    this.mutex.acquire().then(releaseLock => {
      const tabsUrls = sessionState.session.window.tabs.map(tab => tab.url);
      chrome.windows.create({url: tabsUrls, focused: false}, window => {
        const session = SessionUtils.createSessionFromWindow(window as ChromeAPIWindowState);
        const layoutState = LayoutStateUtils.copyWithNewId(sessionState.layoutState, window.id);
        this.sessionListState.insertSession({session, layoutState}, index);
        this.localStorageService.setActiveWindowsState(this.sessionListState)
          .then(releaseLock);
      });
    });
  }

  getChromeWindowsFromAPI(): Promise<ChromeAPIWindowState[]> {
    return new Promise<ChromeAPIWindowState[]>(resolve => {
      chrome.windows.getAll({populate: true}, chromeWindows => {
        chromeWindows = chromeWindows.filter(window => window.type === 'normal');
        resolve(chromeWindows as ChromeAPIWindowState[]);
      });
    });
  }

  getOtherDeviceSessionsFromAPI(): Promise<ChromeAPISession[]> {
    return new Promise<ChromeAPISession[]>(resolve => {
      chrome.sessions.getDevices(devices => {
        console.log(devices.map(device => device.sessions).reduce((sessions, acc) => acc.concat(sessions), []));
      });
    });
  }

  getWindow(windowId: SessionId) {
    return this.sessionListState.getWindow(windowId);
  }

  getTab(windowId: SessionId, tabId: SessionId) {
    return this.sessionListState.getTabFromWindow(windowId, tabId);
  }
}
