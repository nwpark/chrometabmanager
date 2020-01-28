import {InsertWindowMessageData} from '../app/services/messaging/message-passing.service';
import Mutex from 'async-mutex/lib/Mutex';
import {SessionListState} from '../app/types/session/session-list-state';
import {SessionListUtils} from '../app/utils/session-list-utils';
import {LayoutStateUtils, SessionUtils} from '../app/utils/session-utils';
import {LocalStorageService} from '../app/services/storage/local-storage.service';
import {ChromeAPISession} from '../app/types/chrome-api/chrome-api-session';
import {ChromeAPIWindowState, SessionId} from '../app/types/chrome-api/chrome-api-window-state';
import {SessionState} from '../app/types/session/session-state';
import {MessageReceiverService} from '../app/services/messaging/message-receiver.service';
import CreateData = chrome.windows.CreateData;

export class ActiveWindowStateManager {

  private sessionListState: SessionListState;
  private mutex: Mutex;

  constructor(private localStorageService: LocalStorageService,
              private messageReceiverService: MessageReceiverService) {
    this.mutex = new Mutex();
    this.sessionListState = SessionListState.empty();
    this.messageReceiverService.activeSessionStateUpdated$.subscribe(sessionListState => {
      this.sessionListState = sessionListState;
    });
    this.messageReceiverService.onInsertChromeWindowRequest((request: InsertWindowMessageData) => {
      this.insertWindow(request.sessionState, request.index);
    });
    this.updateActiveWindowState();
  }

  updateActiveWindowState() {
    this.mutex.acquire().then(releaseLock => {
      Promise.all([
        this.getChromeWindowsFromAPI(),
        this.localStorageService.getActiveWindowsLayoutState()
          .catch(SessionListUtils.createEmptyListLayoutState)
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
      this.createAPIWindow({url: tabsUrls.shift(), focused: false}).then(window => {
        tabsUrls.forEach(url => this.createAndDiscardTab(url, window.id as number));
        const session = SessionUtils.createSessionFromWindow(window as ChromeAPIWindowState);
        const layoutState = LayoutStateUtils.copyWithNewId(sessionState.layoutState, window.id);
        this.sessionListState.insertSession({session, layoutState}, index);
        this.localStorageService.setActiveWindowsState(this.sessionListState)
          .then(releaseLock);
      }).catch(releaseLock);
    });
  }

  private createAPIWindow(createData: CreateData): Promise<ChromeAPIWindowState> {
    return new Promise<ChromeAPIWindowState>(resolve => {
      chrome.windows.create(createData, window =>
        resolve(window as ChromeAPIWindowState)
      );
    });
  }

  private createAndDiscardTab(url: string, windowId: number) {
    chrome.tabs.create({windowId, url, active: false}, tab => {
      if (url.startsWith('http://') || url.startsWith('https://')) {
        chrome.tabs.executeScript(tab.id as number, {
          code: 'window.stop()',
          runAt: 'document_start'
        }, () => {
          chrome.tabs.discard(tab.id as number);
        });
      }
    });
  }

  private getChromeWindowsFromAPI(): Promise<ChromeAPIWindowState[]> {
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
