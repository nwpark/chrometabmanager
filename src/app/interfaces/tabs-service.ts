import {ChromeAPITabState, ChromeAPIWindowState} from '../types/chrome-api-types';
import {SessionListState} from '../types/session-list-state';
import {SessionState} from '../types/session';

export interface TabsService {

  sessionStateUpdated$;

  getSessionListState(): SessionListState;

  moveWindowInList(sourceIndex: number, targetIndex: number);

  moveTabInWindow(chromeWindow: ChromeAPIWindowState, sourceIndex: number, targetIndex: number);

  transferTab(sourceWindow: ChromeAPIWindowState, targetWindow: ChromeAPIWindowState, sourceIndex: number, targetIndex: number);

  createTab(chromeWindow: ChromeAPIWindowState, tabIndex: number, chromeTab: ChromeAPITabState);

  removeTab(chromeWindow: ChromeAPIWindowState, tabId: any);

  removeSession(index: number);

  toggleSessionListDisplay();

  toggleSessionDisplay(index: number);

  setSessionTitle(index: number, title: string);

  setTabActive(chromeTab: ChromeAPITabState, openInNewTab: boolean);

  insertWindow(sessionState: SessionState, index: number);
}
