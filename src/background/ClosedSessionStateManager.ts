import {ChromeAPITabState, ChromeAPIWindowState, WindowStateUtils} from '../app/types/chrome-api-types';
import {SessionListState, SessionListUtils} from '../app/types/session-list-state';
import {StorageService} from '../app/services/storage.service';
import {ChromeEventHandlerService} from '../app/services/chrome-event-handler.service';
import {modifiesState} from '../app/decorators/modifies-state';

const recentlyClosedSessions = StorageService.RECENTLY_CLOSED_SESSIONS;
const recentlyClosedSessionsLayoutState = StorageService.RECENTLY_CLOSED_SESSIONS_LAYOUT_STATE;

export class ClosedSessionStateManager {

  static readonly MAX_CLOSED_TABS = 10;

  private sessionListState: SessionListState;

  constructor() {
    ChromeEventHandlerService.addClosedSessionStateListener(() => {
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
  storeClosedWindow(chromeWindow: ChromeAPIWindowState) {
    if (this.sessionListState !== undefined) {
      const savedWindow = WindowStateUtils.convertToSavedWindow(chromeWindow);
      const closedSession = SessionListUtils.createClosedSessionFromWindow(savedWindow);
      const windowLayoutState = SessionListUtils.createBasicWindowLayoutState(closedSession.closedWindow.chromeAPIWindow.id);
      this.sessionListState.unshiftSession(closedSession);
      this.sessionListState.unshiftWindowLayoutState(windowLayoutState);
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
    chrome.storage.local.set({
      [recentlyClosedSessions]: this.sessionListState.recentlyClosedSessions,
      [recentlyClosedSessionsLayoutState]: this.sessionListState.layoutState
    });
  }
}
