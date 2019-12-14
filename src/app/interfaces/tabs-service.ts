import {ChromeAPITabState, ChromeAPIWindowState} from '../types/chrome-api-types';
import {SessionListState} from '../types/session-list-state';
import {SessionLayoutState, SessionState} from '../types/session';

export interface TabsService {

  sessionStateUpdated$;

  getSessionListState(): SessionListState;

  moveWindowInList(sourceIndex: number, targetIndex: number);

  moveTabInWindow(chromeWindow: ChromeAPIWindowState, sourceIndex: number, targetIndex: number);

  transferTab(sourceWindow: ChromeAPIWindowState, targetWindow: ChromeAPIWindowState, sourceIndex: number, targetIndex: number);

  createTab(chromeWindow: ChromeAPIWindowState, tabIndex: number, chromeTab: ChromeAPITabState);

  removeTab(chromeWindow: ChromeAPIWindowState, tabId: any);

  removeSession(sessionId: any);

  toggleSessionListDisplay();

  toggleSessionDisplay(sessionId: any);

  setSessionTitle(windowId: any, title: string);

  setTabActive(chromeTab: ChromeAPITabState, openInNewTab: boolean);

  insertWindow(sessionState: SessionState, index: number);
}
