import {ChromeAPITabState, ChromeAPIWindowState} from '../app/types/chrome-api-types';
import {SessionListState} from '../app/types/session-list-state';
import {MessagePassingService} from '../app/services/message-passing.service';
import {modifiesState} from '../app/decorators/modifies-state';
import {SessionListUtils} from '../app/classes/session-list-utils';
import {WindowStateUtils} from '../app/classes/session-utils';
import {LocalStorageService} from '../app/services/local-storage.service';

export class ClosedSessionStateManager {

  static readonly MAX_CLOSED_TABS = 30;

  private localStorageService: LocalStorageService;

  private sessionListState: SessionListState;

  constructor() {
    this.sessionListState = SessionListState.empty();
    MessagePassingService.addClosedSessionStateListener(() => {
      this.refreshState();
    });
    this.refreshState();
  }

  refreshState() {
    this.localStorageService.getRecentlyClosedSessionsState().then(sessionListState => {
      this.sessionListState = sessionListState;
    });
  }

  @modifiesState()
  setSessionListState(sessionListState: SessionListState) {
    this.sessionListState = sessionListState;
  }

  @modifiesState()
  storeClosedWindow(chromeWindow: ChromeAPIWindowState) {
    if (this.sessionListState !== undefined) {
      const savedWindow = WindowStateUtils.convertToSavedWindow(chromeWindow);
      const closedSession = SessionListUtils.createClosedSessionFromWindow(savedWindow);
      const windowLayoutState = SessionListUtils.createClosedWindowLayoutState(closedSession.window.id);
      this.sessionListState.unshiftSession(closedSession, windowLayoutState);
    }
  }

  @modifiesState()
  storeClosedTab(chromeTab: ChromeAPITabState) {
    if (this.sessionListState !== undefined) {
      const savedTab = WindowStateUtils.convertToSavedTab(chromeTab);
      const closedSession = SessionListUtils.createClosedSessionFromTab(savedTab);
      const layoutState = SessionListUtils.createBasicTabLayoutState(closedSession.tab.id);
      this.sessionListState.unshiftSession(closedSession, layoutState);
    }
  }

  private onStateModified() {
    this.sessionListState.removeExpiredSessions(ClosedSessionStateManager.MAX_CLOSED_TABS);
    this.localStorageService.setRecentlyClosedSessionsState(this.sessionListState);
  }
}
