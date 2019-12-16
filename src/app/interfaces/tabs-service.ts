import {ChromeAPITabState, ChromeAPIWindowState, SessionId} from '../types/chrome-api-types';
import {SessionListState} from '../types/session-list-state';
import {SessionState} from '../types/session';

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
