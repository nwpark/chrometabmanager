import {MessagePassingService} from '../app/services/message-passing.service';
import {SessionListUtils} from '../app/classes/session-list-utils';
import {WindowStateUtils} from '../app/classes/session-utils';
import {LocalStorageService} from '../app/services/local-storage.service';
import {ChromeAPIWindowState} from '../app/types/chrome-api-window-state';
import {ChromeAPITabState} from '../app/types/chrome-api-tab-state';
import {ChromeAPISession} from '../app/types/chrome-api-session';
import {SessionLayoutState} from '../app/types/session-layout-state';
import Mutex from 'async-mutex/lib/Mutex';

export class ClosedSessionStateManager {

  static readonly MAX_CLOSED_TABS = 30;

  private localStorageService: LocalStorageService;
  private mutex: Mutex;

  constructor() {
    this.localStorageService = new LocalStorageService(new MessagePassingService());
    this.mutex = new Mutex();
  }

  storeClosedWindow(chromeWindow: ChromeAPIWindowState) {
    const savedWindow = WindowStateUtils.convertToSavedWindow(chromeWindow);
    const closedSession = SessionListUtils.createClosedSessionFromWindow(savedWindow);
    const layoutState = SessionListUtils.createClosedSessionLayoutState(closedSession.window.id);
    this.unshiftSession(closedSession, layoutState);
  }

  storeClosedTab(chromeTab: ChromeAPITabState) {
    const savedTab = WindowStateUtils.convertToSavedTab(chromeTab);
    const closedSession = SessionListUtils.createClosedSessionFromTab(savedTab);
    const layoutState = SessionListUtils.createBasicTabLayoutState(closedSession.tab.id);
    this.unshiftSession(closedSession, layoutState);
  }

  private unshiftSession(session: ChromeAPISession, layoutState: SessionLayoutState) {
    this.mutex.acquire().then(releaseLock => {
      this.localStorageService.getRecentlyClosedSessionsState().then(sessionListState => {
        sessionListState.unshiftSession(session, layoutState);
        sessionListState.removeExpiredSessions(ClosedSessionStateManager.MAX_CLOSED_TABS);
        this.localStorageService.setRecentlyClosedSessionsState(sessionListState)
          .then(releaseLock);
      });
    });
  }
}
