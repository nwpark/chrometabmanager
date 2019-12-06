import {ChromeAPITabState, ChromeAPIWindowState, WindowStateUtils} from '../app/types/chrome-api-types';
import {SessionListState, SessionListUtils} from '../app/types/session-list-state';
import {StorageService} from '../app/services/storage.service';
import {MessagePassingService} from '../app/services/message-passing.service';
import {modifiesState} from '../app/decorators/modifies-state';

export class ClosedSessionStateManager {

  static readonly MAX_CLOSED_TABS = 30;

  private sessionListState: SessionListState;

  constructor() {
    this.sessionListState = SessionListState.empty();
    MessagePassingService.addClosedSessionStateListener(() => {
      this.refreshState();
    });
    this.refreshState();
  }

  refreshState() {
    StorageService.getRecentlyClosedSessionsState().then(sessionListState => {
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
      const windowLayoutState = SessionListUtils.createBasicWindowLayoutState(closedSession.window.chromeAPIWindow.id);
      this.sessionListState.unshiftSession(closedSession, windowLayoutState);
    }
  }

  @modifiesState()
  storeClosedTab(chromeTab: ChromeAPITabState) {
    if (this.sessionListState !== undefined) {
      const savedTab = WindowStateUtils.convertToSavedTab(chromeTab);
      const closedTab = SessionListUtils.createClosedTab(savedTab);
      this.sessionListState.unshiftClosedTab(closedTab);
    }
  }

  private onStateModified() {
    this.sessionListState.removeExpiredSessions(ClosedSessionStateManager.MAX_CLOSED_TABS);
    StorageService.setRecentlyClosedSessionsState(this.sessionListState);
  }
}
