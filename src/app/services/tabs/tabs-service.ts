import {SessionListState} from '../../types/session/session-list-state';
import {SessionId} from '../../types/chrome-api/chrome-api-window-state';
import {ChromeAPITabState} from '../../types/chrome-api/chrome-api-tab-state';
import {SessionState} from '../../types/session/session-state';

export interface TabsService {

  sessionStateUpdated$;

  getSessionListState(): SessionListState;

  moveWindowInList(sourceIndex: number, targetIndex: number);

  moveTabInWindow(windowIndex: number, sourceTabIndex: number, targetTabIndex: number);

  transferTab(sourceWindowIndex: number, targetWindowIndex: number, sourceTabIndex: number, targetTabIndex: number);

  createTab(windowIndex: number, tabIndex: number, chromeTab: ChromeAPITabState);

  removeTab(windowIndex: number, tabId: SessionId);

  setTabTitle(windowIndex: number, tabIndex: number, title: string);

  removeSession(index: number);

  toggleSessionListDisplay();

  toggleSessionDisplay(index: number);

  setSessionTitle(index: number, title: string);

  setTabActive(chromeTab: ChromeAPITabState, openInNewTab: boolean);

  insertWindow(sessionState: SessionState, index: number);

  suspendTab(windowIndex: number, tabIndex: number);
}
