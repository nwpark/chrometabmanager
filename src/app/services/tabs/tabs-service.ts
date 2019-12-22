import {SessionListState} from '../../types/session-list-state';
import {SessionId} from '../../types/chrome-api-window-state';
import {ChromeAPITabState} from '../../types/chrome-api-tab-state';
import {SessionState} from '../../types/session-state';

export interface TabsService {

  sessionStateUpdated$;

  getSessionListState(): SessionListState;

  moveWindowInList(sourceIndex: number, targetIndex: number);

  moveTabInWindow(windowIndex: number, sourceTabIndex: number, targetTabIndex: number);

  transferTab(sourceWindowIndex: number, targetWindowIndex: number, sourceTabIndex: number, targetTabIndex: number);

  createTab(windowIndex: number, tabIndex: number, chromeTab: ChromeAPITabState);

  removeTab(windowIndex: number, tabId: SessionId);

  removeSession(index: number);

  toggleSessionListDisplay();

  toggleSessionDisplay(index: number);

  setSessionTitle(index: number, title: string);

  setTabActive(chromeTab: ChromeAPITabState, openInNewTab: boolean);

  insertWindow(sessionState: SessionState, index: number);
}
